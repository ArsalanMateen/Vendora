import { useEffect, useRef } from 'react';
export default function LoadBoundary({ page, children }) {
  const ref = useRef(null);

  useEffect(() => {
    if (
      !page.hasMore ||
      page.loading ||
      page.loadingMore ||
      page.refreshing ||
      page.loadMoreError ||
      page.refreshError ||
      !ref.current ||
      !window.IntersectionObserver
    )
      return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) page.loadMore();
      },
      { rootMargin: '360px' }
    );
    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [
    page.hasMore,
    page.loading,
    page.loadingMore,
    page.refreshing,
    page.loadMoreError,
    page.refreshError,
    page.loadMore,
    page.data.length,
  ]);

  return (
    <div ref={ref} style={{ padding: '24px 0', textAlign: 'center' }} aria-label="List progress">
      {children}
      {page.loadingMore && <p role="status">Loading more</p>}
      {page.loadMoreError && (
        <>
          <p role="alert">{page.loadMoreError}</p>
          <button onClick={page.loadMore}>Try again</button>
        </>
      )}
      {page.refreshError && (
        <>
          <p role="alert">{page.refreshError}</p>
          <button onClick={page.refresh}>Try again</button>
        </>
      )}
      {page.hasMore && !window.IntersectionObserver && (
        <button disabled={page.refreshing} onClick={page.loadMore}>
          Load more
        </button>
      )}
    </div>
  );
}
