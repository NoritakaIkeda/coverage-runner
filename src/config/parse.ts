import { ConfigSchema, type Config } from '../types/config.js'

export type ParseResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

export function parseConfig(config: unknown): ParseResult<Config> {
  try {
    const result = ConfigSchema.parse(config)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Unknown validation error' }
  }
}