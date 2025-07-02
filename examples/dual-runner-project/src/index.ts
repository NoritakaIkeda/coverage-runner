/**
 * Main entry point for the dual-runner example
 */

export { Calculator, MathUtils } from './calculator'
export { StringUtils, TextProcessor } from './stringUtils'

/**
 * Demo function that uses both calculator and string utilities
 */
export function createReport(numbers: number[], description: string): string {
  const calc = new Calculator()
  const stringUtils = new StringUtils()
  
  const sum = numbers.reduce((acc, num) => calc.add(acc, num), 0)
  const average = sum / numbers.length
  const capitalizedDesc = stringUtils.capitalize(description)
  
  return `${capitalizedDesc}: Sum=${sum}, Average=${average.toFixed(2)}`
}

/**
 * Application configuration
 */
export const AppConfig = {
  name: 'Dual Runner Example',
  version: '1.0.0',
  description: 'Demonstrates coverage-runner with Jest and Vitest',
  
  /**
   * Get application info
   */
  getInfo(): string {
    return `${this.name} v${this.version} - ${this.description}`
  }
}

// Demo usage
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(AppConfig.getInfo())
  console.log(createReport([1, 2, 3, 4, 5], 'sample numbers'))
}