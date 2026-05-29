# boilerHack

Boilerplate frontend liviano para hackathons. Pensado para construir un MVP en 48–72h.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** estricto + React Compiler
- **Tailwind CSS v4** + **shadcn/ui** (componentes copy-paste que viven en `src/components/ui/`)
- **next-themes** para dark mode con persistencia
- **TanStack Query** para hablar con el backend de tus compañeros
- **react-hook-form** + **Zod** para formularios validados
- **sonner** para toasts, **lucide-react** para iconos

## Arrancar

```bash
npm install
cp .env.example .env.local   # ajustá la URL del backend
npm run dev
```

Abrí <http://localhost:3000>.

## Estructura

```
src/
  app/                # Rutas (App Router)
    layout.tsx        # Providers (theme, query, toaster)
    page.tsx          # Home
    globals.css       # Tailwind v4 + tokens shadcn
  components/
    ui/               # Componentes shadcn — los modificás libremente
    providers/        # ThemeProvider y QueryProvider
    theme-toggle.tsx
  hooks/              # Tus hooks custom
  lib/
    api/client.ts     # apiClient<T>() tipado + ApiError
    env.ts            # Variables de entorno validadas con Zod
    utils.ts          # cn() para clases Tailwind
```

## Cómo hacer cosas

### Agregar un componente de shadcn

```bash
npx shadcn@latest add <nombre>
# ejemplo: npx shadcn@latest add data-table
```

Lista completa: <https://ui.shadcn.com/docs/components>

### Llamar al backend

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { apiClient } from '@/lib/api/client';
import { env } from '@/lib/env';

const UserSchema = z.object({ id: z.string(), name: z.string() });

export function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () =>
      apiClient(`${env.NEXT_PUBLIC_API_URL}/users`, {
        schema: z.array(UserSchema),
      }),
  });

  if (isLoading) return <p>Cargando…</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <ul>
      {data?.map(u => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

### Formulario con validación

```tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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

const schema = z.object({ email: z.string().email() });
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: Values) => {
    toast.success(`Bienvenido, ${values.email}`);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder="tu@email.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Entrar</Button>
      </form>
    </Form>
  );
}
```

### Agregar una variable de entorno

1. Definila en `.env.local`
2. Sumá la validación en `src/lib/env.ts`
3. Importá desde `@/lib/env` (no uses `process.env` directo en el código)

## Scripts

| Comando                | Qué hace                                           |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Server de desarrollo                               |
| `npm run build`        | Build de producción                                |
| `npm run start`        | Sirve el build de producción                       |
| `npm run lint`         | ESLint                                             |
| `npm run typecheck`    | `tsc --noEmit` — chequeo de tipos sin generar dist |
| `npm run format`       | Prettier en todo el repo (modificación)            |
| `npm run format:check` | Verifica formato sin tocar archivos (lo usa CI)    |

## CI

Hay un workflow en `.github/workflows/ci.yml` que corre `format:check + lint + typecheck + build` en cada push y PR a `main`. Si rompés algo, te avisa antes del merge.

## Decisiones de diseño

- **Sin Storybook, sin tests, sin Husky.** Cero fricción durante un hackathon. Si querés deploy con preview en cada PR, usá Vercel directo desde GitHub.
- **shadcn vs componentes propios:** lo que se instala con `shadcn add` se queda en tu repo, lo editás como cualquier archivo.
- **Tailwind v4:** todo configurado en `globals.css` con `@import 'tailwindcss'`. No hay `tailwind.config.js`.
- **`apiClient` con Zod opcional:** validá las respuestas críticas del backend (login, payment); para endpoints simples podés omitir `schema`.
