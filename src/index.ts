export function main(): void {
  console.log('Hello, Coverage Runner!');
}

// ESM equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
