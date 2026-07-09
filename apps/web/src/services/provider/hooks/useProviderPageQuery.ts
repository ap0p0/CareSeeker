import { useCallback, useEffect, useState } from "react";

type UseProviderPageQueryOptions<T> = {
  fetcher: () => Promise<T>;
  initialData?: T | null;
};

type UseProviderPageQueryResult<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
};

export function useProviderPageQuery<T>({
  fetcher,
  initialData,
}: UseProviderPageQueryOptions<T>): UseProviderPageQueryResult<T> {
  const [data, setData] = useState<T | null>(initialData ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        if (!cancelled) {
          setData(result);
        }
      } catch {
        if (!cancelled) {
          setError("Something went wrong while loading this page.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetcher, reloadToken]);

  return { data, isLoading, error, reload };
}
