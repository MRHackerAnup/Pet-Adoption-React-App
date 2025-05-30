import { useState, useEffect } from 'react';

/**
 * A hook that delays updating a value until a certain timeout has passed.
 * Useful for reducing API calls on frequently changing values like input fields.
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if the value changes before the delay has expired
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}