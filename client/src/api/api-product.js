import { batch } from './product-batch.js';

const create = async (params, credentials, product) => {
  try {
    let response = await fetch('/api/products/by/' + params.shopId, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + credentials.t,
      },
      body: product,
    });
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

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

const update = async (params, credentials, product) => {
  try {
    let response = await fetch('/api/product/' + params.shopId + '/' + params.productId, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + credentials.t,
      },
      body: product,
    });
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

const remove = async (params, credentials) => {
  try {
    let response = await fetch('/api/product/' + params.shopId + '/' + params.productId, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + credentials.t,
      },
    });
    return await response.json();
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

export {
  batch,
  create,
  read,
  update,
  remove,
  listByShop,
  listRelated,
  listCategories,
  metadata,
  list,
};
