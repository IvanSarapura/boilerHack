import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { env } from '@/lib/env';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border flex items-center justify-between border-b px-6 py-4">
        <span className="text-sm font-semibold tracking-tight">
          {env.NEXT_PUBLIC_APP_NAME}
        </span>
        <ThemeToggle />
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-6 px-6 py-16">
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Listo para hackear.
        </h1>
        <p className="text-muted-foreground max-w-prose text-pretty">
          Boilerplate frontend con Next.js 16, Tailwind v4, shadcn/ui, TanStack
          Query, react-hook-form y Zod. Edit{' '}
          <code className="bg-muted rounded px-1.5 py-0.5 text-sm">
            src/app/page.tsx
          </code>{' '}
          y empezá a maquetar.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a
              href="https://ui.shadcn.com/docs/components"
              target="_blank"
              rel="noreferrer"
            >
              Componentes shadcn
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a
              href="https://tanstack.com/query/latest/docs/framework/react/overview"
              target="_blank"
              rel="noreferrer"
            >
              TanStack Query
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
