const config = {
  stripe_publishable_key: import.meta.env.VITE_STRIPE_TEST_PUBLISHABLE_KEY,
  stripe_connect_client_id: import.meta.env.VITE_STRIPE_CONNECT_TEST_CLIENT_ID,
};

export default config;
