'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useCreateItem } from '../hooks';
import { ItemCreateSchema, type ItemCreate } from '../schemas';

export function ItemForm() {
  const createItem = useCreateItem();
  const form = useForm<ItemCreate>({
    resolver: zodResolver(ItemCreateSchema),
    defaultValues: { title: '', description: '' },
  });

  function onSubmit(values: ItemCreate) {
    createItem.mutate(values, {
      onSuccess: () => {
        toast.success('Item creado');
        form.reset();
      },
      onError: error => toast.error(error.message),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Nuevo item" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input
                  placeholder="Opcional"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={createItem.isPending}>
          {createItem.isPending ? 'Creando…' : 'Crear item'}
        </Button>
      </form>
    </Form>
  );
}
