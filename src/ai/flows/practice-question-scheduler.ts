'use server';

import { ai } from '@/ai/genkit';
import { JA_HEADER } from '@/ai/constants';
import { z } from 'genkit';

const SchedulePracticeQuestionsInputSchema = z.object({
  timeOfDay: z.string().describe('The time of day to schedule practice questions (e.g., 9:00 AM).'),
  numQuestionsPerDay: z.number().describe('The number of practice questions to deliver per day.'),
  preferredSubjects: z.array(z.string()).optional().describe('The subjects the user prefers to practice.'),
  difficulty: z.string().optional().describe('The difficulty level of the practice questions (e.g., easy, medium, hard).'),
  userPerformanceData: z.record(z.number()).optional().describe('A record per subject; higher value means more struggle.'),
});
export type SchedulePracticeQuestionsInput = z.infer<typeof SchedulePracticeQuestionsInputSchema>;

const SchedulePracticeQuestionsOutputSchema = z.object({
  scheduledQuestions: z.array(z.object({
    subject: z.string(),
    question: z.string(),
    answer: z.string(),
  })),
});
export type SchedulePracticeQuestionsOutput = z.infer<typeof SchedulePracticeQuestionsOutputSchema>;

export async function schedulePracticeQuestions(input: SchedulePracticeQuestionsInput): Promise<SchedulePracticeQuestionsOutput> {
  return schedulePracticeQuestionsFlow(input);
}

export async function getReviewScheduleForUser(userId: string): Promise<SchedulePracticeQuestionsOutput> {
  // Minimal hackathon-friendly behavior: prefer weak-subjects if provided in future
  const preferred = ['math-quad-1']
  return schedulePracticeQuestionsFlow({ timeOfDay: 'now', numQuestionsPerDay: 3, preferredSubjects: preferred })
}

const recommendQuestion = ai.defineTool({
  name: 'recommendQuestion',
  description: 'Recommends a practice question for a given subject, adapting to the user performance.',
  inputSchema: z.object({ subject: z.string(), difficulty: z.string().optional() }),
  outputSchema: z.object({ question: z.string(), answer: z.string() }),
}, async (input) => {
  // Placeholder tool
  return {
    question: `基本問題: ${input.subject} について説明しなさい。`,
    answer: `${input.subject} の定義・性質を説明する。`,
  };
});

const prompt = ai.definePrompt({
  name: 'schedulePracticeQuestionsPrompt',
  input: { schema: SchedulePracticeQuestionsInputSchema },
  output: { schema: SchedulePracticeQuestionsOutputSchema },
  tools: [recommendQuestion],
  prompt: `${JA_HEADER}` + `You are an AI assistant that schedules practice questions.

  The user wants {{numQuestionsPerDay}} questions per day at {{timeOfDay}}.
  Preferred subjects: {{preferredSubjects}}.
  Performance (higher is weaker area): {{userPerformanceData}}.

  Recommend questions, focusing more on weaker areas, using the tool when helpful.
  Return JSON with scheduledQuestions[{ subject, question, answer }].`,
});

const schedulePracticeQuestionsFlow = ai.defineFlow(
  {
    name: 'schedulePracticeQuestionsFlow',
    inputSchema: SchedulePracticeQuestionsInputSchema,
    outputSchema: SchedulePracticeQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
