import { useEffect, useState, useCallback } from 'react';
export default function useCursorList(loader, identity, field = 'products', enabled = true) {
  const [state, setState] = useState({
    data: [],
    totalCount: 0,
    hasMore: false,
    nextCursor: null,
    loading: enabled,
    error: ''
  });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({
      data: [],
      totalCount: 0,
      hasMore: false,
      nextCursor: null,
      loading: enabled,
      error: ''
    });
    if (enabled) Promise.resolve(loader(null, controller.signal)).then(page => {
      if (!controller.signal.aborted) setState({
        ...page,
        data: page[field],
        loading: false,
        error: ''
      });
    }).catch(error => {
      if (!controller.signal.aborted) setState(previous => ({
        ...previous,
        loading: false,
        error: error.message
      }));
    });
    return () => controller.abort();
  }, [identity, revision, enabled]);
  return {
    ...state,
    retry: useCallback(() => setRevision(value => value + 1), [])
  };
}
