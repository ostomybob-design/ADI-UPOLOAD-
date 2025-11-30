/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap
 * @param timeoutMs Timeout in milliseconds (default: 15000)
 * @returns The promise result or throws timeout error
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 15000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Executes a function with retry logic
 * @param fn The async function to execute
 * @param maxAttempts Maximum number of attempts (default: 2)
 * @param delayMs Delay between retries in milliseconds (default: 1000)
 * @returns The function result or throws the last error
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 2,
  delayMs: number = 1000
): Promise<T> {
  let attempts = 0;
  let lastError: Error | unknown;

  while (attempts < maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempts++;
      
      console.error(`Attempt ${attempts} failed:`, error);
      
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}
