import { z } from 'zod';

type ApiClientOptions<T> = RequestInit & {
  schema?: z.ZodSchema<T>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  url: string,
  options: ApiClientOptions<T> = {},
): Promise<T> {
  const { schema, ...fetchOptions } = options;

  const res = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(await errorMessage(res), res.status);
  }

  // 204 No Content (p. ej. DELETE) o cuerpo vacío.
  if (res.status === 204) {
    return undefined as T;
  }

  const data = (await res.json()) as unknown;

  if (schema) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      throw new ApiError(
        `Schema validation failed: ${parsed.error.message}`,
        422,
      );
    }
    return parsed.data;
  }

  return data as T;
}

// Lee el envelope { error: { message } } del backend si está presente.
async function errorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    if (body.error?.message) {
      return body.error.message;
    }
  } catch {
    // respuesta sin cuerpo JSON
  }
  return `HTTP ${res.status}: ${res.statusText}`;
}
