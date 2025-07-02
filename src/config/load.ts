import { cosmiconfig } from 'cosmiconfig'
import { promises as fs } from 'fs'
import type { Config } from '../types/config.js'

const MODULE_NAME = 'coverage'

export async function loadConfig(cwd: string, configPath?: string): Promise<Config> {
  try {
    if (configPath != null && configPath !== '') {
      // Explicit config path provided
      try {
        const configContent = await fs.readFile(configPath, 'utf-8')
        const parsed: unknown = JSON.parse(configContent)
        return parsed as Config
      } catch {
        return {}
      }
    }

    // Use cosmiconfig for automatic discovery
    const explorer = cosmiconfig(MODULE_NAME, {
      searchPlaces: [
        'coverage.config.js',
        'coverage.config.cjs',
        'coverage.config.mjs',
        '.coverage-config.json',
        '.coveragerc.json',
        'package.json'
      ]
    })

    const result = await explorer.search(cwd)
    
    if (result?.config != null) {
      return result.config as Config
    }

    return {}
  } catch {
    return {}
  }
}