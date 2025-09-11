'use server';

/**
 * @fileOverview AI-powered personalized learning path generator.
 *
 * - generateLearningPath - A function that generates learning paths based on user performance.
 * - LearningPathInput - The input type for the generateLearningPath function.
 * - LearningPathOutput - The return type for the generateLearningPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningPathInputSchema = z.object({
  userPerformanceData: z
    .string()
    .describe('A string containing the user performance data, including subjects studied, time spent, and scores on quizzes.'),
  userGoals: z.string().describe('The user goals, such as the subject they want to learn, or the score they want to achieve.'),
});
export type LearningPathInput = z.infer<typeof LearningPathInputSchema>;

const LearningPathOutputSchema = z.object({
  learningPath: z.string().describe('A detailed learning path tailored to the user, including specific topics to study and resources to use.'),
});
export type LearningPathOutput = z.infer<typeof LearningPathOutputSchema>;

import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function generateLearningPath(input: LearningPathInput): Promise<LearningPathOutput> {
  return generateLearningPathFlow(input);
}

/**
 * Higher-level function to generate a personalized learning path for a specific user.
 * It fetches user data, analyzes it, and then calls the Genkit flow.
 */
export async function getPersonalizedLearningPathForUser(userId: string, userGoals: string): Promise<LearningPathOutput> {
  if (!userId) {
    throw new Error('User ID is required.');
  }

  // 1. Fetch user's recent session data from Firestore
  const sessionsQuery = query(
    collection(db, `sessions/${userId}/items`),
    where('status', '==', 'completed'),
    orderBy('endedAt', 'desc'),
    limit(50) // Limit to the last 50 sessions to keep it manageable
  );
  const querySnapshot = await getDocs(sessionsQuery);
  const sessions = querySnapshot.docs.map(doc => doc.data());

  if (sessions.length === 0) {
    return { learningPath: "まだ十分な学習データがありません。いくつかの単元を学習して、あなただけの学習プランを作成しましょう！" };
  }

  // 2. Analyze the data
  const modulePerformance: Record<string, { totalDuration: number; totalFocus: number; count: number }> = {};
  const timeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };

  sessions.forEach(session => {
    if (session.moduleId) {
      if (!modulePerformance[session.moduleId]) {
        modulePerformance[session.moduleId] = { totalDuration: 0, totalFocus: 0, count: 0 };
      }
      modulePerformance[session.moduleId].totalDuration += session.durationSec || 0;
      modulePerformance[session.moduleId].totalFocus += session.avgFocus || 0;
      modulePerformance[session.moduleId].count++;
    }

    if (session.startedAt) {
      const hour = session.startedAt.toDate().getHours();
      if (hour >= 5 && hour < 12) timeOfDay.morning++;
      else if (hour >= 12 && hour < 17) timeOfDay.afternoon++;
      else if (hour >= 17 && hour < 22) timeOfDay.evening++;
      else timeOfDay.night++;
    }
  });

  // Find weakest module (lowest average focus)
  let weakestModule = null;
  let lowestFocus = 101;
  for (const moduleId in modulePerformance) {
    const perf = modulePerformance[moduleId];
    const avgFocus = perf.count > 0 ? perf.totalFocus / perf.count : 0;
    if (avgFocus < lowestFocus) {
      lowestFocus = avgFocus;
      weakestModule = moduleId;
    }
  }

  // Find most concentrated time of day
  const bestTime = Object.entries(timeOfDay).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const timeMap = { morning: '午前', afternoon: '午後', evening: '夕方', night: '夜' };

  // 3. Format the analysis into a string for the AI prompt
  let userPerformanceData = `
- ユーザーは最近、以下の単元を学習しました: ${Object.keys(modulePerformance).join(', ')}
- 特に苦手な単元は「${weakestModule || '特定できませんでした'}」で、平均集中度は約${Math.round(lowestFocus)}%でした。
- 最も集中して学習できる時間帯は「${(timeMap as any)[bestTime]}」のようです。
  `;

  // 4. Call the Genkit flow
  const input: LearningPathInput = {
    userPerformanceData,
    userGoals,
  };

  return generateLearningPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learningPathPrompt',
  input: {schema: LearningPathInputSchema},
  output: {schema: LearningPathOutputSchema},
  prompt: `You are an expert learning path generator. You will use the user's performance data and goals to create a tailored learning path.

User Performance Data: {{{userPerformanceData}}}
User Goals: {{{userGoals}}}

Create a detailed learning path, including specific topics to study and resources to use.`,
});

const generateLearningPathFlow = ai.defineFlow(
  {
    name: 'generateLearningPathFlow',
    inputSchema: LearningPathInputSchema,
    outputSchema: LearningPathOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
