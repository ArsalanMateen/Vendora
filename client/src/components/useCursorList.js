import { useCallback, useEffect, useRef, useState } from 'react';

const empty = {
  data: [],
  totalCount: 0,
  hasMore: false,
  nextCursor: null,
  loading: true,
  loadingMore: false,
  refreshing: false,
  error: '',
  loadMoreError: '',
  refreshError: '',
};

function validatePage(page, field, cursor) {
  if (
    !Array.isArray(page?.[field]) ||
    page[field].some(item => typeof item?._id !== 'string' || !item._id) ||
    typeof page.hasMore !== 'boolean' ||
    !Number.isInteger(page.totalCount) ||
    page.totalCount < 0 ||
    (page.hasMore
      ? typeof page.nextCursor !== 'string' || !page.nextCursor || page.nextCursor === cursor
      : page.nextCursor !== null)
  )
    throw new Error(page?.error || 'The response could not be loaded. Please try again.');
}

export default function useCursorList(loader, identity, field = 'products', enabled = true) {
  const [state, setState] = useState({ ...empty, identity });
  const [revision, setRevision] = useState(0);

  const current = useRef(state);
  const request = useRef(null);
  const generation = useRef(0);
  const loadedPages = useRef(0);
  const loaderRef = useRef(loader);

  loaderRef.current = loader;
  current.current = state;

  const fetchPage = useCallback(
    async (cursor, token, key) => {
      if (request.current) return;
      const controller = new AbortController();
      request.current = controller;
      setState(previous => ({
        ...previous,
        loading: !cursor,
        loadingMore: !!cursor,
        error: cursor ? previous.error : '',
        loadMoreError: '',
      }));
      try {
        const page = await loaderRef.current(cursor, controller.signal);
        if (controller.signal.aborted || token !== generation.current) return;
        validatePage(page, field, cursor);
        loadedPages.current = cursor ? loadedPages.current + 1 : 1;
        setState(previous => {
          if (token !== generation.current) return previous;
          const existing = cursor ? previous.data : [];
          const ids = new Set(existing.map(item => item._id));
          const additions = page[field].filter(item => {
            if (!item?._id || ids.has(item._id)) return false;
            ids.add(item._id);

            return true;
          });

          return {
            ...previous,
            identity: key,
            data: [...existing, ...additions],
            totalCount: page.totalCount,
            hasMore: page.hasMore,
            nextCursor: page.nextCursor,
            loading: false,
            loadingMore: false,
          };
        });
      } catch (error) {
        if (!controller.signal.aborted && token === generation.current)
          setState(previous => ({
            ...previous,
            loading: false,
            loadingMore: false,
            [cursor ? 'loadMoreError' : 'error']: error.message,
          }));
      } finally {
        if (request.current === controller) request.current = null;
      }
    },
    [field]
  );

  useEffect(() => {
    request.current?.abort();
    request.current = null;
    const token = ++generation.current;
    loadedPages.current = 0;
    setState({ ...empty, identity, loading: enabled });
    if (enabled) fetchPage(null, token, identity);

    return () => {
      request.current?.abort();
      request.current = null;
      ++generation.current;
    };
  }, [identity, enabled, revision, fetchPage]);

  const loadMore = useCallback(() => {
    const page = current.current;
    if (page.identity === identity && page.hasMore && !page.loading && !page.loadingMore)
      fetchPage(page.nextCursor, generation.current, identity);
  }, [identity, fetchPage]);

  // Reconnect recovery keeps mounted cards/timers and revalidates only loaded pages.
  

  const remove = useCallback(
    id =>
      setState(previous => ({
        ...previous,
        data: previous.data.filter(item => item._id !== id),
        totalCount: Math.max(0, previous.totalCount - 1),
      })),
    []
  );

  const setData = useCallback(
    value =>
      setState(previous => ({
        ...previous,
        data: typeof value === 'function' ? value(previous.data) : value,
      })),
    []
  );

  return {
    ...(state.identity === identity ? state : { ...empty, identity }),
    loadMore,
    remove,
    setData,

    retry: useCallback(() => setRevision(value => value + 1), []),
  };
}
