'use client';

import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { useDeleteItem, useItems, useUpdateItem } from '../hooks';

export function ItemList() {
  const { data: items, isLoading, error } = useItems();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-sm">{error.message}</p>;
  }

  if (!items?.length) {
    return (
      <p className="text-muted-foreground text-sm">No hay items todavía.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map(item => (
        <li
          key={item.id}
          className="border-border flex items-center justify-between gap-3 rounded-md border px-4 py-3"
        >
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{item.title}</span>
            {item.description ? (
              <span className="text-muted-foreground text-xs">
                {item.description}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={item.done ? 'default' : 'outline'}>
              {item.done ? 'Hecho' : 'Pendiente'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                updateItem.mutate({ id: item.id, data: { done: !item.done } })
              }
            >
              {item.done ? 'Reabrir' : 'Completar'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                deleteItem.mutate(item.id, {
                  onSuccess: () => toast.success('Item eliminado'),
                  onError: error => toast.error(error.message),
                })
              }
            >
              Eliminar
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
