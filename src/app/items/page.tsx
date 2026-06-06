import { ThemeToggle } from '@/components/theme-toggle';
import { ItemForm } from '@/features/items/components/item-form';
import { ItemList } from '@/features/items/components/item-list';

export default function ItemsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border flex items-center justify-between border-b px-6 py-4">
        <span className="text-sm font-semibold tracking-tight">Items</span>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
        <section className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            Demo CRUD end-to-end
          </h1>
          <p className="text-muted-foreground text-sm">
            Frontend → FastAPI → base de datos. Editá esta feature en{' '}
            <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
              src/features/items
            </code>
            .
          </p>
        </section>

        <ItemForm />
        <ItemList />
      </main>
    </div>
  );
}
