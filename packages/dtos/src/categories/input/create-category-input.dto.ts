import z from 'zod';

export const createCategoryInputSchema = z.object({
  name: z.string('Invalid name').trim().min(1, 'Name is required')
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;