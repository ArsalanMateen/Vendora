import { apiUrl } from "../config/config.js";

const create = async (params, credentials, shop) => {
  try {
    let response = await fetch(apiUrl("/api/shops/by/" + params.userId), {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: shop,
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: "Network error" };
  }
};

const list = async (signal) => {
  try {
    let response = await fetch(apiUrl("/api/shops"), {
      method: "GET",
      signal: signal,
    });
    return await response.json();
  } catch (err) {
    if (err.name === "AbortError") return;
    console.error(err);
    return { error: "Network error" };
  }
};

const listByOwner = async (params, credentials, signal) => {
  try {
    let response = await fetch(apiUrl("/api/shops/by/" + params.userId), {
      method: "GET",
      signal: signal,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    if (err.name === "AbortError") return;
    console.error(err);
    return { error: "Network error" };
  }
};

const read = async (params, signal) => {
  try {
    let response = await fetch(apiUrl("/api/shop/" + params.shopId), {
      method: "GET",
      signal: signal,
    });
    return await response.json();
  } catch (err) {
    if (err.name === "AbortError") return;
    console.error(err);
    return { error: "Network error" };
  }
};

const update = async (params, credentials, shop) => {
  try {
    let response = await fetch(apiUrl("/api/shop/" + params.shopId), {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: shop,
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: "Network error" };
  }
};

const remove = async (params, credentials) => {
  try {
    let response = await fetch(apiUrl("/api/shop/" + params.shopId), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: "Network error" };
  }
};

export { create, list, listByOwner, read, update, remove };
