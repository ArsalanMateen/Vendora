const create = async (params, credentials, order, token) => {
  try {
    let response = await fetch('/api/order/new/' + params.userId, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + credentials.t,
      },
      body: JSON.stringify({ order: order, token: token }),
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: 'Network error' };
  }
};

const read = async (params, credentials, signal) => {
  try {
    let response = await fetch('/api/order/' + params.orderId, {
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

export { create, read };
