import { z } from 'zod';

export const projectConfigValidator = z.object({
  dirTypes: z.object({
    frontend: z
      .object({ paths: z.array(z.string()), tests: z.array(z.string()).optional() })
      .optional(),
    backend: z
      .object({ paths: z.array(z.string()), tests: z.array(z.string()).optional() })
      .optional(),
    infra: z
      .object({ paths: z.array(z.string()), tests: z.array(z.string()).optional() })
      .optional(),
  }),
});
