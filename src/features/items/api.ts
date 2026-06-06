import { z } from 'zod';

import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/env';

import {
  ItemSchema,
  type Item,
  type ItemCreate,
  type ItemUpdate,
} from './schemas';

const ITEMS_URL = `${env.NEXT_PUBLIC_API_URL}/api/v1/items`;

export function listItems(): Promise<Item[]> {
  return apiClient(ITEMS_URL, { schema: z.array(ItemSchema) });
}

export function createItem(data: ItemCreate): Promise<Item> {
  return apiClient(ITEMS_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    schema: ItemSchema,
  });
}

export function updateItem(id: string, data: ItemUpdate): Promise<Item> {
  return apiClient(`${ITEMS_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    schema: ItemSchema,
  });
}

export function deleteItem(id: string): Promise<void> {
  return apiClient(`${ITEMS_URL}/${id}`, { method: 'DELETE' });
}
