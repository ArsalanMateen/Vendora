import mongoose from 'mongoose';
import { placeOrder } from '../helpers/placeOrder.js';
import { Order } from '../models/order.model.js';

import Product from '../models/product.model.js';

import Stripe from 'stripe';
import config from '../config/config.js';
const myStripe = new Stripe(config.stripe_test_secret_key);

const create = async (req, res) => {
  try {
    const result = await placeOrder(req.body.order || req.body, req.body.token, req.profile._id, {
      Product,
      Order,
      payment: myStripe,
      startSession: () => mongoose.startSession(),
      makeId: () => new mongoose.Types.ObjectId(),
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not place order' });
  }
};

export default { create };
