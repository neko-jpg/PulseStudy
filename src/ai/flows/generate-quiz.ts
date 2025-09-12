'use server';

import { ai } from '@/ai/genkit'
import { JA_HEADER } from '@/ai/constants'
import { z } from 'genkit'

const QuizItemSchema = z.object({
  q: z.string(),
  choices: z.array(z.string()).min(2),
  answer: z.number(),
  exp: z.string(),
})

const ModuleDocSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.string().optional(),
  explain: z.array(z.string()),
  items: z.array(QuizItemSchema).min(3),
})

export type GenQuizInput = { topic: string; id?: string; subject?: string; num?: number }
export type GenQuizOutput = z.infer<typeof ModuleDocSchema>

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: z.object({ topic: z.string(), num: z.number().optional() }) },
  output: { schema: ModuleDocSchema },
  prompt: `${JA_HEADER}` + `以下のトピックについて、日本語で要点と小テストを作成してください。\n\n` +
    `トピック: {{topic}}\n` +
    `出力要件: JSON オブジェクトで { id, title, subject, explain[string[]], items[{ q, choices[string[]], answer(number, 0-index), exp }]} を返してください。`,
})

export const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: z.object({ topic: z.string(), id: z.string().optional(), subject: z.string().optional(), num: z.number().optional() }),
    outputSchema: ModuleDocSchema,
  },
  async (input) => {
    const { output } = await prompt({ topic: input.topic, num: input.num ?? 5 })
    const doc = output!
    // Ensure id/subject
    return { ...doc, id: input.id || doc.id || 'gen-ai', subject: input.subject || doc.subject || '' }
  }
)

