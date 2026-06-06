'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createItem, deleteItem, listItems, updateItem } from './api';
import type { ItemCreate, ItemUpdate } from './schemas';

const ITEMS_KEY = ['items'] as const;

export function useItems() {
  return useQuery({ queryKey: ITEMS_KEY, queryFn: listItems });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ItemCreate) => createItem(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ITEMS_KEY }),
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ItemUpdate }) =>
      updateItem(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ITEMS_KEY }),
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ITEMS_KEY }),
  });
}
