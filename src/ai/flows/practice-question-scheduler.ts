'use server';

/**
 * @fileOverview A flow for scheduling practice questions on a regular cadence and adapting to user performance.
 *
 * - schedulePracticeQuestions - A function that handles the scheduling of practice questions.
 * - SchedulePracticeQuestionsInput - The input type for the schedulePracticeQuestions function.
 * - SchedulePracticeQuestionsOutput - The return type for the schedulePracticeQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SchedulePracticeQuestionsInputSchema = z.object({
  timeOfDay: z.string().describe('The time of day to schedule practice questions (e.g., 9:00 AM).'),
  numQuestionsPerDay: z.number().describe('The number of practice questions to deliver per day.'),
  preferredSubjects: z.array(z.string()).optional().describe('The subjects the user prefers to practice.'),
  difficulty: z.string().optional().describe('The difficulty level of the practice questions (e.g., easy, medium, hard).'),
  userPerformanceData: z.record(z.number()).optional().describe('A record of the user performance data for each subject, with higher numbers indicating more struggles.'),
});
export type SchedulePracticeQuestionsInput = z.infer<typeof SchedulePracticeQuestionsInputSchema>;

const SchedulePracticeQuestionsOutputSchema = z.object({
  scheduledQuestions: z.array(z.object({
    subject: z.string().describe('The subject of the practice question.'),
    question: z.string().describe('The practice question text.'),
    answer: z.string().describe('The answer to the practice question.'),
  })).describe('The list of scheduled practice questions.'),
});
export type SchedulePracticeQuestionsOutput = z.infer<typeof SchedulePracticeQuestionsOutputSchema>;

import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function schedulePracticeQuestions(input: SchedulePracticeQuestionsInput): Promise<SchedulePracticeQuestionsOutput> {
  return schedulePracticeQuestionsFlow(input);
}

/**
 * Higher-level function to generate a dynamic review schedule for a user.
 * It fetches quiz attempt data, analyzes it, and then calls the Genkit flow.
 */
export async function getReviewScheduleForUser(userId: string): Promise<SchedulePracticeQuestionsOutput> {
    if (!userId) {
        throw new Error('User ID is required.');
    }

    // 1. Fetch user's recent quiz attempts
    const attemptsQuery = query(
        collection(db, 'quiz_attempts'),
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc'),
        limit(100) // Analyze last 100 attempts
    );
    const querySnapshot = await getDocs(attemptsQuery);
    const attempts = querySnapshot.docs.map(doc => doc.data());

    if (attempts.length < 5) {
        return { scheduledQuestions: [{
            subject: 'math-quad-1',
            question: '縺ｾ縺壹・繧ｯ繧､繧ｺ繧・蝠丈ｻ･荳願ｧ｣縺・※縲√≠縺ｪ縺溘・縺溘ａ縺ｮ蠕ｩ鄙偵・繝ｩ繝ｳ繧剃ｽ懊ｊ縺ｾ縺励ｇ縺・ｼ・,
            answer: '鬆大ｼｵ縺｣縺ｦ縺上□縺輔＞・・
        }] };
    }

    // 2. Analyze performance to find struggling subjects
    const performance: Record<string, { correct: number; incorrect: number }> = {};
    const strugglingSubjects: Record<string, number> = {};

    attempts.forEach(attempt => {
        if (!performance[attempt.moduleId]) {
            performance[attempt.moduleId] = { correct: 0, incorrect: 0 };
        }
        if (attempt.isCorrect) {
            performance[attempt.moduleId].correct++;
        } else {
            performance[attempt.moduleId].incorrect++;
        }
    });

    for (const moduleId in performance) {
        const { correct, incorrect } = performance[moduleId];
        if (incorrect > correct) {
            // Higher number indicates more struggle
            strugglingSubjects[moduleId] = incorrect / (correct + incorrect);
        }
    }

    // 3. Call the Genkit flow with the analyzed data
    const input: SchedulePracticeQuestionsInput = {
        timeOfDay: 'now',
        numQuestionsPerDay: 3, // Generate 3 review questions
        userPerformanceData: strugglingSubjects,
        preferredSubjects: Object.keys(strugglingSubjects),
    };

    return schedulePracticeQuestionsFlow(input);
}

const recommendQuestion = ai.defineTool({
  name: 'recommendQuestion',
  description: 'Recommends a practice question for a given subject, adapting to the user performance.',
  inputSchema: z.object({
    subject: z.string().describe('The subject for which to recommend a practice question.'),
    difficulty: z.string().optional().describe('The difficulty level of the practice question (e.g., easy, medium, hard).'),
  }),
  outputSchema: z.object({
    question: z.string().describe('The practice question text.'),
    answer: z.string().describe('The answer to the practice question.'),
  }),
}, async (input) => {
  // Here, connect to a service or database to fetch a practice question based on the subject and difficulty.
  // Adapt the question based on user performance data (input.userPerformanceData).
  // For now, return a placeholder question and answer.
  return {
    question: `What is a basic question about ${input.subject}?`,
    answer: `The answer to the ${input.subject} question.`, // Replace with actual answer.
  };
});

const prompt = ai.definePrompt({
  name: 'schedulePracticeQuestionsPrompt',
  input: {schema: SchedulePracticeQuestionsInputSchema},
  output: {schema: SchedulePracticeQuestionsOutputSchema},
  tools: [recommendQuestion],
  prompt: `You are an AI assistant that schedules practice questions for users.

  The user wants to schedule {{numQuestionsPerDay}} practice questions per day at {{timeOfDay}}.

  The user has the following preferred subjects: {{preferredSubjects}}.

  The user has the following performance data: {{userPerformanceData}}.

  Based on the user's preferences and performance, recommend practice questions using the recommendQuestion tool. Focus more on subjects in userPerformanceData with higher values because the user struggles in those areas.  If userPerformanceData is not provided, weigh the preferred subjects equally.

  Return a JSON object containing a list of scheduled questions, each including the subject, question, and answer.
  `,
});

const schedulePracticeQuestionsFlow = ai.defineFlow(
  {
    name: 'schedulePracticeQuestionsFlow',
    inputSchema: SchedulePracticeQuestionsInputSchema,
    outputSchema: SchedulePracticeQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

