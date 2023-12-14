async function tryOrReturn<T, U>(
  fn: () => Promise<T>,
  fallback: U,
): Promise<T | U> {
  try {
    return await fn();
  } catch (error) {
    console.error('Error:', (error as Error).message);
    return fallback;
  }
}

export default tryOrReturn;
