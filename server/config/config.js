import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.VENDORA_DB_URI,
  mongoDbName: process.env.VENDORA_NS,
  stripe_connect_test_client_id: process.env.STRIPE_CONNECT_TEST_CLIENT_ID,
  stripe_test_secret_key: process.env.STRIPE_TEST_SECRET_KEY,
  stripe_test_api_key: process.env.STRIPE_TEST_PUBLISHABLE_KEY,
  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
    publicUrl: process.env.R2_PUBLIC_URL,
  },
};

export default config;
