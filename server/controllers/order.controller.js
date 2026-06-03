import mongoose from 'mongoose';
import { placeOrder } from '../helpers/placeOrder.js';
import { Order, CartItem } from '../models/order.model.js';
import { listQuery, listResult } from '../helpers/listPagination.js';
import Product from '../models/product.model.js';
import errorHandler from '../helpers/dbErrorHandler.js';
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

const listByShop = async (req, res) => {
  try {
    const filter = { 'products.shop': req.shop._id };
    const query = listQuery(req.query, filter);
    const [rows, totalCount] = await Promise.all([
      Order.find(query.pageFilter)
        .select('_id products customer_name customer_email delivery_address created')
        .sort(query.sort)
        .limit(query.limit + 1)
        .populate('products.product', '_id name price image')
        .populate('products.shop', '_id name')
        .lean(),
      Order.countDocuments(filter),
    ]);
    res.json(listResult(rows, totalCount, query, 'orders'));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { orderId, itemIndex, cartItemId, status } = req.body;
    const byIndex =
      /^[a-f\d]{24}$/i.test(orderId || '') && Number.isInteger(itemIndex) && itemIndex >= 0;
    const byItemId = /^[a-f\d]{24}$/i.test(cartItemId || '');
    if ((!byIndex && !byItemId) || !CartItem.schema.path('status').enumValues.includes(status)) {
      return res.status(400).json({ error: 'Please select a valid order item and status.' });
    }
    const filter = byIndex
      ? { _id: orderId, [`products.${itemIndex}.shop`]: req.shop._id }
      : { products: { $elemMatch: { _id: cartItemId, shop: req.shop._id } } };
    const statusPath = byIndex ? `products.${itemIndex}.status` : 'products.$.status';
    let order = await Order.updateOne(filter, {
      $set: {
        [statusPath]: status,
      },
    });
    if (!(order.n || order.matchedCount))
      return res.status(404).json({ error: 'This order item was not found in your shop.' });
    res.json(order);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const getStatusValues = (req, res) => {
  res.json(CartItem.schema.path('status').enumValues);
};

const orderByID = async (req, res, next, id) => {
  try {
    let order = await Order.findById(id)
      .select('_id products customer_name delivery_address created user')
      .lean()
      .populate('products.product', '_id name price image')
      .populate('products.shop', '_id name')
      .exec();
    if (!order) {
      return res.status(400).json({ error: 'Order not found' });
    }
    req.order = order;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Could not retrieve order' });
  }
};

const read = (req, res) => {
  return res.json(req.order);
};

const listByUser = async (req, res) => {
  try {
    const filter = { user: req.profile._id };
    const query = listQuery(req.query, filter);
    const [rows, totalCount] = await Promise.all([
      Order.find(query.pageFilter)
        .select('_id products created')
        .sort(query.sort)
        .limit(query.limit + 1)
        .populate('products.product', '_id name price image')
        .populate('products.shop', '_id name')
        .lean(),
      Order.countDocuments(filter),
    ]);
    res.json(listResult(rows, totalCount, query, 'orders'));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default {
  create,
  listByShop,
  update,
  getStatusValues,
  orderByID,
  read,
  listByUser,
};
