import { z } from 'zod';

// Espejo 1:1 de los esquemas Pydantic en backend/app/schemas/item.py.
export const ItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  done: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ItemCreateSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(200),
  description: z.string().max(2000).optional(),
  // El valor por defecto (false) lo aplica el backend (Pydantic ItemCreate).
  done: z.boolean().optional(),
});

export const ItemUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  done: z.boolean().optional(),
});

export type Item = z.infer<typeof ItemSchema>;
export type ItemCreate = z.infer<typeof ItemCreateSchema>;
export type ItemUpdate = z.infer<typeof ItemUpdateSchema>;
