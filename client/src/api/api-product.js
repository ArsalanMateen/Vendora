
const read = async (params, signal) => {
  try {
    let response = await fetch('/api/products/' + params.productId, {
      method: 'GET',
      signal: signal,
    });
    const data = await response.json();
    return response.status === 404 ? { ...data, notFound: true } : data;
  } catch (err) {
    console.error(err);
  }
};

const queryString = params =>
  new URLSearchParams(
    Object.entries(params || {}).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  ).toString();

const getJSON = async (url, signal) => {
  const response = await fetch(url, { signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not load products');

  return data;
};

const listByShop = ({ shopId, ...params }, signal) =>
  getJSON('/api/products/by/' + shopId + '?' + queryString(params), signal);

const listRelated = async (params, signal) => {
  try {
    let response = await fetch('/api/products/related/' + params.productId, {
      method: 'GET',
      signal: signal,
    });
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

const metadata = (params, signal) =>
  getJSON('/api/products/categories?' + queryString(params), signal);

const listCategories = async signal =>
  (await metadata({}, signal)).categories.map(item => item.name);

const list = (params, signal) => getJSON('/api/products?' + queryString(params), signal);

export { list, listByShop, metadata, listCategories, read, listRelated };
