export default function LoadBoundary({
  page,
  children
}) {
  return <div aria-label="List progress">
    {children}
    {page.loadingMore && <p role="status">Loading more</p>}
    {page.loadMoreError && <p role="alert">
      {page.loadMoreError}
    </p>}
    {page.hasMore && <button onClick={page.loadMore}>Load more</button>}
  </div>;
}
