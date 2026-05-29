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
    throw new ApiError(`HTTP ${res.status}: ${res.statusText}`, res.status);
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
