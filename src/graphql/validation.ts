import { z } from 'zod';
import { GraphQLError } from 'graphql';

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    throw new GraphQLError('Validation failed', {
      extensions: {
        code: 'BAD_USER_INPUT',
        errors: result.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
    });
  }
  return result.data;
}