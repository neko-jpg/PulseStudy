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

export async function schedulePracticeQuestions(input: SchedulePracticeQuestionsInput): Promise<SchedulePracticeQuestionsOutput> {
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
