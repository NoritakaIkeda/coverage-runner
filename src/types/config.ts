import { z } from 'zod';

export const ConfigSchema = z.object({
  runnerOverrides: z.record(z.string(), z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
  mergeStrategy: z.enum(['merge', 'separate']).optional(),
});

export type Config = z.infer<typeof ConfigSchema>;
