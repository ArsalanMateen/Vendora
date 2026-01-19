import { apiUrl } from "../config/config.js";
const create = async user => {
  try {
    let response = await fetch(apiUrl('/api/users', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: 'Network error occurred' };
  }
};

export { create };
