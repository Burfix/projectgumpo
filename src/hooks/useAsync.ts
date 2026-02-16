"use client";

import { useState, useEffect, useCallback } from "react";

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

type UseAsyncOptions = {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
};

/**
 * Hook for managing async operations with loading/error states
 */
export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });

    try {
      const data = await asyncFunction();
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (error: any) {
      const errorMessage = error.message || "An error occurred";
      setState({ data: null, loading: false, error: errorMessage });
      onError?.(errorMessage);
      throw error;
    }
  }, [asyncFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for managing API fetches with automatic retry
 */
export function useFetch<T>(
  url: string | null,
  options: RequestInit & { retry?: number; retryDelay?: number } = {}
) {
  const { retry = 0, retryDelay = 1000, ...fetchOptions } = options;
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!url) throw new Error("URL is required");

    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }, [url, fetchOptions]);

  const result = useAsync<T>(fetchData, {
    immediate: !!url,
    onError: (error) => {
      if (retryCount < retry) {
        setTimeout(() => {
          setRetryCount(c => c + 1);
        }, retryDelay);
      }
    },
  });

  const refetch = useCallback(() => {
    setRetryCount(0);
    return result.execute();
  }, [result]);

  return {
    ...result,
    refetch,
    retryCount,
  };
}

/**
 * Hook for managing multiple async operations
 */
export function useAsyncBatch<T extends Record<string, () => Promise<any>>>(
  operations: T
): {
  [K in keyof T]: {
    data: Awaited<ReturnType<T[K]>> | null;
    loading: boolean;
    error: string | null;
  };
} & {
  executeAll: () => Promise<void>;
  loading: boolean;
  hasErrors: boolean;
} {
  type Results = {
    [K in keyof T]: {
      data: Awaited<ReturnType<T[K]>> | null;
      loading: boolean;
      error: string | null;
    };
  };

  const [results, setResults] = useState<Results>(() => {
    const initial: any = {};
    Object.keys(operations).forEach((key) => {
      initial[key] = { data: null, loading: true, error: null };
    });
    return initial;
  });

  const executeAll = useCallback(async () => {
    // Reset all to loading
    const loadingState: any = {};
    Object.keys(operations).forEach((key) => {
      loadingState[key] = { data: null, loading: true, error: null };
    });
    setResults(loadingState);

    // Execute all operations
    await Promise.allSettled(
      Object.entries(operations).map(async ([key, fn]) => {
        try {
          const data = await fn();
          setResults((prev) => ({
            ...prev,
            [key]: { data, loading: false, error: null },
          }));
        } catch (error: any) {
          setResults((prev) => ({
            ...prev,
            [key]: { data: null, loading: false, error: error.message },
          }));
        }
      })
    );
  }, [operations]);

  useEffect(() => {
    executeAll();
  }, [executeAll]);

  const loading = Object.values(results).some((r: any) => r.loading);
  const hasErrors = Object.values(results).some((r: any) => r.error);

  return {
    ...results,
    executeAll,
    loading,
    hasErrors,
  };
}
