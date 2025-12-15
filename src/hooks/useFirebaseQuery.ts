import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

interface UseFetchOptions {
  showErrorToast?: boolean;
  errorMessage?: string;
}

export const useFirebaseQuery = <T,>(
  queryFn: () => Promise<T>,
  options: UseFetchOptions = { showErrorToast: true }
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      
      if (options.showErrorToast) {
        toast({
          title: "Error",
          description: options.errorMessage || error.message,
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [queryFn, options, toast]);

  return { data, loading, error, execute, setData };
};

// For mutations (create, update, delete)
export const useFirebaseMutation = <TData, TResult = void>(
  mutationFn: (data: TData) => Promise<TResult>,
  options: UseFetchOptions & { onSuccess?: (result: TResult) => void } = {}
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const mutate = useCallback(
    async (data: TData) => {
      try {
        setLoading(true);
        setError(null);
        const result = await mutationFn(data);
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        
        if (options.showErrorToast !== false) {
          toast({
            title: "Error",
            description: options.errorMessage || error.message,
            variant: "destructive",
          });
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, options, toast]
  );

  return { mutate, loading, error };
};
