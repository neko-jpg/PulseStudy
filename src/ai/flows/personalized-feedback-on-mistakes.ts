'use server';

import { ai } from '@/ai/genkit';
import { JA_HEADER } from '@/ai/constants';
import { z } from 'genkit';

const PersonalizedFeedbackInputSchema = z.object({
  question: z.string().describe('The practice question the user is attempting to answer.'),
  userAnswer: z.string().describe('The user-provided answer to the question.'),
  subject: z.string().describe('The subject or topic of the question.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the question.'),
  hintsUsed: z.number().describe('The number of hints the user has already used for this question.'),
});
export type PersonalizedFeedbackInput = z.infer<typeof PersonalizedFeedbackInputSchema>;

const PersonalizedFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback and hints to help the user understand the question and identify mistakes.'),
});
export type PersonalizedFeedbackOutput = z.infer<typeof PersonalizedFeedbackOutputSchema>;

export async function getPersonalizedFeedback(input: PersonalizedFeedbackInput): Promise<PersonalizedFeedbackOutput> {
  return personalizedFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedFeedbackPrompt',
  input: { schema: PersonalizedFeedbackInputSchema },
  output: { schema: PersonalizedFeedbackOutputSchema },
  prompt: `${JA_HEADER}` + `You are an AI tutor that gives short, actionable feedback.

  The student is working on a {{subject}} question (difficulty: {{difficulty}}). They already used {{hintsUsed}} hints.

  Based on the question and the student's answer, explain the key point, give one concrete example, and conclude with the next step.

  Question: {{{question}}}
  Student's Answer: {{{userAnswer}}}

  Feedback:`,
});

const personalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'personalizedFeedbackFlow',
    inputSchema: PersonalizedFeedbackInputSchema,
    outputSchema: PersonalizedFeedbackOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
