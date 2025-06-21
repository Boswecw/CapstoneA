import { useState, useCallback } from 'react';
import { handleApiError } from '../utils/apiErrorHandler';

export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, errorMessage) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMsg = handleApiError(err, errorMessage);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, loading, error, clearError: () => setError(null) };
};