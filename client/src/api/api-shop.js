const create = async (params, credentials, shop) => {
  try {
    let response = await fetch('/api/shops/by/' + params.userId, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + credentials.t,
      },
      body: shop,
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: 'Network error' };
  }
};

const list = async signal => {
  try {
    let response = await fetch('/api/shops', {
      method: 'GET',
      signal: signal,
    });
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

const listByOwner = async (params, credentials, signal) => {
  try {
    let response = await fetch('/api/shops/by/' + params.userId, {
      method: 'GET',
      signal: signal,
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

const read = async (params, signal) => {
  try {
    let response = await fetch('/api/shop/' + params.shopId, {
      method: 'GET',
      signal: signal,
    });
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

const update = async (params, credentials, shop) => {
  try {
    let response = await fetch('/api/shop/' + params.shopId, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + credentials.t,
      },
      body: shop,
    });
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

const remove = async (params, credentials) => {
  try {
    let response = await fetch('/api/shop/' + params.shopId, {
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

export { create, list, listByOwner, read, update, remove };
