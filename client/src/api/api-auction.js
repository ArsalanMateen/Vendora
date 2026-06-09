const auctionPage = async (url, params, credentials, signal) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value != null)
  ).toString();
  const response = await fetch(url + '?' + query, {
    signal,
    headers: credentials ? { Authorization: 'Bearer ' + credentials.t } : {},
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not load auctions');

  return data;
};

export const counts = signal => auctionPage('/api/auctions/counts', {}, null, signal);

const create = async (params, credentials, auction) => {
  try {
    let response = await fetch('/api/auctions/by/' + params.userId, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + credentials.t,
      },
      body: auction,
    });
    return response.json();
  } catch (err) {
    console.error(err);
  }
};

const listOpen = (signal, params = {}) => auctionPage('/api/auctions', params, null, signal);

const listBySeller = ({ userId, ...params }, credentials, signal) =>
  auctionPage('/api/auctions/by/' + userId, params, credentials, signal);

const listByBidder = ({ userId, ...params }, credentials, signal) =>
  auctionPage('/api/auctions/bid/' + userId, params, credentials, signal);

const read = async (params, signal) => {
  try {
    let response = await fetch('/api/auction/' + params.auctionId, {
      method: 'GET',
      signal: signal,
    });
    return await response.json();
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error(err);
    }
  }
};

const update = async (params, credentials, auction) => {
  try {
    let response = await fetch('/api/auctions/' + params.auctionId, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + credentials.t,
      },
      body: auction,
    });
    return response.json();
  } catch (err) {
    console.error(err);
  }
};

const remove = async (params, credentials) => {
  try {
    let response = await fetch('/api/auctions/' + params.auctionId, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + credentials.t,
      },
    });
    return response.json();
  } catch (err) {
    console.error(err);
  }
};

export { create, listOpen, listBySeller, listByBidder, read, update, remove };
