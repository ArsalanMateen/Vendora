import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';

// Routes
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import shopRoutes from './routes/shop.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import auctionRoutes from './routes/auction.routes.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(helmet());
app.use(cors());

app.get('/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.set('Cache-Control', 'no-store');
  return res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'unavailable' });
});

// Mount API routes
app.use('/', userRoutes);
app.use('/', authRoutes);
app.use('/', shopRoutes);
app.use('/', productRoutes);
app.use('/', orderRoutes);
app.use('/', auctionRoutes);

// Catch unauthorized errors
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: err.name + ': ' + err.message });
  } else if (err) {
    return res.status(400).json({ error: err.name + ': ' + err.message });
  }
});

export default app;
