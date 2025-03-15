import { z } from 'zod';

export const dirTypeValidator = z.object({
  paths: z.array(z.string()),
  tests: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
});

export const projectConfigValidator = z.object({
  dirTypes: z.object({
    frontend: dirTypeValidator.optional(),
    backend: dirTypeValidator.optional(),
    infra: dirTypeValidator.optional(),
  }),
});
