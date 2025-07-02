export function square(x) {
  return x * x;
}

export function cube(x) {
  return x * x * x;
}

export function isEven(n) {
  return n % 2 === 0;
}

export function factorial(n) {
  if (n < 0) {
    throw new Error('Factorial of negative number is not defined');
  }
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}