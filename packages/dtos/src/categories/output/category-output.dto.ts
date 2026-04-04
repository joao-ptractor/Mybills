import z from 'zod';

export const categoryOutputSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type CategoryOutput = z.infer<typeof categoryOutputSchema>;