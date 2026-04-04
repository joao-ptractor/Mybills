import z from 'zod';

export const updateCategoryInputSchema = z
  .object({
    name: z.string('Invalid name').trim().min(1, 'Name is required').optional()
  })
  .refine((data) => data.name !== undefined, {
    message: 'At least one field must be provided'
  });

export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;