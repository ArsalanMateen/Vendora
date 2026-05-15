import { useCallback, useEffect, useState } from 'react';

export default function useRemoteList(loader) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    Promise.resolve(loader(controller.signal))
      .then(result => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(result))
          throw new Error(result?.error || 'We couldn’t load this just now. Please try again.');
        setData(result);
      })
      .catch(err => {
        if (!controller.signal.aborted)
          setError(err.message || 'Something went wrong. Please try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [loader, revision]);

  const retry = useCallback(() => setRevision(value => value + 1), []);

  return { data, loading, error, retry };
}
