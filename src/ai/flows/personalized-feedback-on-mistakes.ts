'use server';
/**
 * @fileOverview Provides personalized feedback and hints to users when they get stuck on practice questions.
 *
 * - getPersonalizedFeedback - A function that generates custom feedback for a given question and user answer.
 * - PersonalizedFeedbackInput - The input type for the getPersonalizedFeedback function.
 * - PersonalizedFeedbackOutput - The return type for the getPersonalizedFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  input: {schema: PersonalizedFeedbackInputSchema},
  output: {schema: PersonalizedFeedbackOutputSchema},
  prompt: `【重要】出力は必ず日本語で行ってください。丁寧語で、短く分かりやすい要点・具体例・次の一手を含めてください。対象は中学生/高校生向けです。

  You are an AI assistant designed to provide personalized feedback and hints to students who are stuck on practice questions.

  The student is currently working on a {{subject}} question with difficulty level {{difficulty}}. They have already used {{hintsUsed}} hints.

  Provide feedback based on the student's answer and the question. Focus on helping them understand the underlying concepts and identify any mistakes they made.

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
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
