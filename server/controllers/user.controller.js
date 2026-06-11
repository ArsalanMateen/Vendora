import User from '../models/user.model.js';
import errorHandler from '../helpers/dbErrorHandler.js';

const create = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    return res.status(200).json({ message: 'Successfully signed up!' });
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const userByID = async (req, res, next, id) => {
  try {
    let query = User.findById(id);
    if (req.method === 'GET' && !req.path.startsWith('/api/stripe_auth/'))
      query = query.select('_id name email seller created updated').lean();
    let user = await query;
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    req.profile = user;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Could not retrieve user' });
  }
};

const read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;

  return res.json({
    _id: req.profile._id,
    name: req.profile.name,
    email: req.profile.email,
    seller: req.profile.seller,
    created: req.profile.created,
    updated: req.profile.updated,
  });
};

const list = async (req, res) => {
  try {
    let users = await User.find().select('_id name created seller').lean();
    res.json(users);
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const update = async (req, res) => {
  try {
    let user = req.profile;
    for (const key of ['name', 'email', 'seller', 'password'])
      if (req.body[key] !== undefined) user[key] = req.body[key];
    user.updated = Date.now();
    await user.save();
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      seller: user.seller,
      created: user.created,
      updated: user.updated,
    });
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const remove = async (req, res) => {
  try {
    let user = req.profile;
    let deletedUser = await User.findByIdAndDelete(user._id);
    deletedUser.hashed_password = undefined;
    deletedUser.salt = undefined;
    res.json({ _id: deletedUser._id, name: deletedUser.name });
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

import Stripe from 'stripe';
import config from '../config/config.js';

const myStripe = new Stripe(config.stripe_test_secret_key);

const isSeller = (req, res, next) => {
  const isSeller = req.profile && req.profile.seller;
  if (!isSeller) {
    return res.status(403).json({ error: 'User is not a seller' });
  }
  next();
};

const stripe_auth = async (req, res) => {
  try {
    const response = await myStripe.oauth.token({
      grant_type: 'authorization_code',
      code: req.query.code,
    });
    let user = req.profile;
    user.stripe_seller = response;
    await user.save();
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json({ _id: user._id, name: user.name, email: user.email, seller: user.seller });
  } catch (err) {
    return res.status(400).json({
      error: 'Could not connect Stripe account: ' + (err.message || err),
    });
  }
};

const stripeCustomer = async (req, res, next) => {
  try {
    if (!req.body.token) {
      return next();
    }
    if (req.profile.stripe_customer) {
      const customer = await myStripe.customers.update(req.profile.stripe_customer, {
        source: req.body.token,
      });
      req.customer = customer;
      next();
    } else {
      const customer = await myStripe.customers.create({
        email: req.profile.email,
        source: req.body.token,
      });
      await User.findByIdAndUpdate(req.profile._id, { stripe_customer: customer.id });
      req.customer = customer;
      next();
    }
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Could not link Stripe customer: ' + (err.message || err) });
  }
};

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update,
  isSeller,
  stripe_auth,
  stripeCustomer,
};
