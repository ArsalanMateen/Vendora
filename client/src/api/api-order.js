import { apiUrl } from "../config/config.js";

const create = async (params, credentials, order, token) => {
  try {
    let response = await fetch(apiUrl("/api/order/new/" + params.userId), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: JSON.stringify({ order: order, token: token }),
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: "Network error" };
  }
};

const listByShop = async (params, credentials, signal) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([key, value]) => key !== "shopId" && value != null,
    ),
  ).toString();
  const response = await fetch(
    apiUrl("/api/orders/shop/" + params.shopId + "?" + query),
    {
      signal,
      headers: { Authorization: "Bearer " + credentials.t },
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not load orders");

  return data;
};

const update = async (params, credentials, product) => {
  try {
    let response = await fetch(apiUrl("/api/order/status/" + params.shopId), {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + credentials.t,
      },
      body: JSON.stringify(product),
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: "Network error" };
  }
};

const getStatusValues = async (signal) => {
  try {
    let response = await fetch(apiUrl("/api/order/status_values"), {
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

const listByUser = async (params, credentials, signal) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([key, value]) => key !== "userId" && value != null,
    ),
  ).toString();
  const response = await fetch(
    apiUrl("/api/orders/user/" + params.userId + "?" + query),
    {
      signal,
      headers: { Authorization: "Bearer " + credentials.t },
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not load orders");

  return data;
};

const read = async (params, credentials, signal) => {
  try {
    let response = await fetch(apiUrl("/api/order/" + params.orderId), {
      method: "GET",
      signal: signal,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + credentials.t,
      },
    });
    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: "Network error" };
  }
};

export { create, listByShop, update, getStatusValues, listByUser, read };
