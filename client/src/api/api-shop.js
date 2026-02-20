import { apiUrl } from "../config/config.js";
const list = async signal => {
  try {
    let response = await fetch(apiUrl('/api/shops', {
      method: 'GET',
      signal: signal,
    });
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

const read = async (params, signal) => {
  try {
    let response = await fetch(apiUrl('/api/shop/' + params.shopId, {
      method: 'GET',
      signal: signal,
    });
    return await response.json();
  } catch (err) {
    console.error(err);
  }
};

export { list, read };
