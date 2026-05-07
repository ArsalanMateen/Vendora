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

export { fetchProducts };
export async function batch(ids, signal) { const ordered = [...new Set(ids)]; const products = await fetchProducts(ordered, signal); const found = new Map(products.map(product => [product._id, product])); return ordered.map(id => found.get(id)).filter(Boolean); }
