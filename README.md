# boilerHack

Boilerplate frontend liviano para hackathons. Pensado para construir un MVP en 48–72h.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** estricto + React Compiler
- **Tailwind CSS v4** + **shadcn/ui** (componentes copy-paste que viven en `src/components/ui/`)
- **next-themes** para dark mode con persistencia
- **TanStack Query** para hablar con el backend
- **react-hook-form** + **Zod** para formularios validados
- **sonner** para toasts, **lucide-react** para iconos
- **Backend FastAPI** opcional en `backend/` (Python, agnóstico al motor de BD) — ver [`backend/README.md`](backend/README.md)

## Arrancar

Solo frontend:

```bash
npm install
cp .env.example .env.local   # ajustá la URL del backend
npm run dev
```

Frontend + backend FastAPI (los dos a la vez):

```bash
npm install
npm run backend:install          # instala deps Python con uv
cp backend/.env.example backend/.env
npm run backend:migrate          # crea las tablas (SQLite por defecto, sin Docker)
npm run dev:all                  # web en :3000 + API en :8000
```

Abrí <http://localhost:3000> (demo CRUD en <http://localhost:3000/items>) y la API en <http://localhost:8000/docs>.

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
  features/           # Features con backend (api + hooks + schemas + componentes)
    items/            # Ejemplo CRUD end-to-end — copialo para tus recursos
  hooks/              # Tus hooks custom
  lib/
    api/client.ts     # apiClient<T>() tipado + ApiError
    env.ts            # Variables de entorno validadas con Zod
    utils.ts          # cn() para clases Tailwind

backend/              # API FastAPI agnóstica al motor (ver backend/README.md)
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

### Crear un recurso con backend

La feature `src/features/items/` es la plantilla de referencia. Para un recurso nuevo, copiala y renombrá:

```
src/features/<recurso>/
  schemas.ts    # Zod, espejo 1:1 de los esquemas Pydantic del backend
  api.ts        # funciones que llaman a apiClient con env.NEXT_PUBLIC_API_URL
  hooks.ts      # hooks de TanStack Query (useQuery / useMutation + invalidación)
  components/   # UI que consume los hooks
```

Del lado del backend, copiá el slice de `items` (model → schemas → repository → service → router). Ver [`backend/README.md`](backend/README.md).

### Agregar una variable de entorno

1. Definila en `.env.local`
2. Sumá la validación en `src/lib/env.ts`
3. Importá desde `@/lib/env` (no uses `process.env` directo en el código)

> Variables del backend (secrets, `DATABASE_URL`): van en `backend/.env`, **no** en el frontend. Nunca uses el prefijo `NEXT_PUBLIC_` para secrets.

## Scripts

| Comando                     | Qué hace                                           |
| --------------------------- | -------------------------------------------------- |
| `npm run dev`               | Server de desarrollo                               |
| `npm run build`             | Build de producción                                |
| `npm run start`             | Sirve el build de producción                       |
| `npm run lint`              | ESLint                                             |
| `npm run typecheck`         | `tsc --noEmit` — chequeo de tipos sin generar dist |
| `npm run format`            | Prettier en todo el repo (modificación)            |
| `npm run format:check`      | Verifica formato sin tocar archivos (lo usa CI)    |
| `npm run dev:all`           | Frontend (:3000) + backend FastAPI (:8000) juntos  |
| `npm run backend:dev`       | Solo la API FastAPI con reload                     |
| `npm run backend:migrate`   | Aplica migraciones Alembic                         |
| `npm run backend:seed`      | Datos demo en la BD                                |
| `npm run backend:test`      | Tests del backend (pytest)                         |
| `npm run db:up` / `db:down` | Levanta/baja PostgreSQL con Docker Compose         |

Los scripts `backend:*` usan [uv](https://docs.astral.sh/uv/). Instalalo con `curl -LsSf https://astral.sh/uv/install.sh | sh` si no lo tenés.

## CI

Hay un workflow en `.github/workflows/ci.yml` que corre `format:check + lint + typecheck + build` en cada push y PR a `main`. Si rompés algo, te avisa antes del merge.

## Decisiones de diseño

- **Frontend sin Storybook ni Husky.** Cero fricción durante un hackathon. Si querés deploy con preview en cada PR, usá Vercel directo desde GitHub.
- **shadcn vs componentes propios:** lo que se instala con `shadcn add` se queda en tu repo, lo editás como cualquier archivo.
- **Tailwind v4:** todo configurado en `globals.css` con `@import 'tailwindcss'`. No hay `tailwind.config.js`.
- **`apiClient` con Zod opcional:** validá las respuestas críticas del backend (login, payment); para endpoints simples podés omitir `schema`.
- **Backend desacoplado y agnóstico al motor.** FastAPI separado en `:8000` con SQLAlchemy detrás de un patrón repositorio: cambiás de SQLite a Postgres/MySQL/SQL Server con una sola variable. Trae tests (pytest) porque la lógica de datos sí conviene cubrirla.
