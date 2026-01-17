const config = {
  server_url: import.meta.env.VITE_API_URL || "",
  stripe_publishable_key: import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY,
  stripe_connect_client_id: import.meta.env.VITE_STRIPE_CONNECT_TEST_CLIENT_ID,
};

export const apiUrl = (path) => `${config.server_url}${path}`;

export default config;
