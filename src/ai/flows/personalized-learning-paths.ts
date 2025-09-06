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

export async function generateLearningPath(input: LearningPathInput): Promise<LearningPathOutput> {
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
