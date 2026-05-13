const pending = new Map();

async function fetchProducts(ids, signal) {
  const products = [];
  for (let offset = 0; offset < ids.length; offset += 100) {
    const response = await fetch('/api/products/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ids.slice(offset, offset + 100) }),
      signal,
    });
    const data = await response.json();
    if (
      !response.ok ||
      !Array.isArray(data.products) ||
      data.products.some(product => typeof product?._id !== 'string')
    )
      throw new Error(data.error || 'Could not load products');
    products.push(...data.products);
  }

  return products;
}

// Share in-flight lookups only. A one-turn grace period coalesces StrictMode replay;
// no product prices or availability are cached between visits.
export function batch(ids, signal) {
  const ordered = [...new Set(ids)];
  if (!ordered.length) return Promise.resolve([]);
  if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
  const sorted = [...ordered].sort();
  const key = JSON.stringify(sorted);
  let group = pending.get(key);
  if (!group) {
    const controller = new AbortController();
    group = { controller, users: 0, timer: null };
    group.promise = fetchProducts(sorted, controller.signal).finally(() => {
      if (pending.get(key) === group) pending.delete(key);
    });
    pending.set(key, group);
  }
  clearTimeout(group.timer);
  group.users++;

  return new Promise((resolve, reject) => {
    let settled = false;

    const release = () => {
      if (settled) return false;
      settled = true;
      signal?.removeEventListener('abort', abort);
      group.users--;
      if (!group.users)
        group.timer = setTimeout(() => {
          if (!group.users) {
            group.controller.abort();
            if (pending.get(key) === group) pending.delete(key);
          }
        }, 0);

      return true;
    };

    const abort = () => {
      if (release()) reject(new DOMException('Aborted', 'AbortError'));
    };

    signal?.addEventListener('abort', abort, { once: true });
    group.promise.then(
      products => {
        if (!release()) return;
        const found = new Map(products.map(product => [product._id, product]));
        resolve(ordered.map(id => found.get(id)).filter(Boolean));
      },
      error => {
        if (release()) reject(error);
      }
    );
  });
}
