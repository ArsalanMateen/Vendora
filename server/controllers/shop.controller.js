import Shop from '../models/shop.model.js';

import errorHandler from '../helpers/dbErrorHandler.js';
import formidable from 'formidable';
import { deleteImage } from '../helpers/r2.js';

const create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: 'Shop details could not be processed' });
    }
    if (Object.keys(files).length || fields.image)
      return res.status(400).json({ error: 'Shop images are no longer accepted.' });
    let shop = new Shop({ name: fields.name, description: fields.description });
    shop.owner = req.profile;
    try {
      let result = await shop.save();
      res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
    }
  });
};

const shopByID = async (req, res, next, id) => {
  try {
    let query = Shop.findById(id).populate('owner', '_id name');
    if (req.method === 'GET') query = query.select('_id name description owner created').lean();
    let shop = await query.exec();
    if (!shop) {
      return res.status(400).json({ error: 'Shop not found' });
    }
    req.shop = shop;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Could not retrieve shop' });
  }
};

const photo = (req, res, next) => {
  if (req.shop && req.shop.image) {
    if (typeof req.shop.image === 'string' && req.shop.image.startsWith('http')) {
      return res.redirect(302, req.shop.image);
    }
    if (req.shop.image.data) {
      res.set('Content-Type', req.shop.image.contentType);
      return res.send(req.shop.image.data);
    }
  }
  next();
};

const defaultPhoto = (req, res) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#f1f5f9"/>
    <g fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(140, 140) scale(5)">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </g>
  </svg>`;
  res.set('Content-Type', 'image/svg+xml');

  return res.send(svg);
};

const read = (req, res) => {
  return res.json(req.shop);
};

const update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: 'Shop details could not be processed' });
    }
    let shop = req.shop;
    if (Object.keys(files).length || fields.image)
      return res.status(400).json({ error: 'Shop images are no longer accepted.' });
    if (fields.name !== undefined) shop.name = fields.name;
    if (fields.description !== undefined) shop.description = fields.description;
    shop.updated = Date.now();
    try {
      let result = await shop.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
    }
  });
};

const remove = async (req, res) => {
  try {
    let shop = req.shop;
    if (shop.image && typeof shop.image === 'string' && shop.image.startsWith('http')) {
      await deleteImage(shop.image);
    }
    let deletedShop = await Shop.findByIdAndDelete(shop._id);
    res.json(deletedShop);
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const list = async (req, res) => {
  try {
    let shops = await Shop.find()
      .select('_id name description owner created')
      .lean()
      .populate('owner', '_id name');
    res.json(shops);
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const listByOwner = async (req, res) => {
  try {
    let shops = await Shop.find({ owner: req.profile._id })
      .select('_id name description owner created')
      .lean()
      .populate('owner', '_id name');
    res.json(shops);
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const isOwner = (req, res, next) => {
  const isOwner = req.shop && req.auth && req.shop.owner._id == req.auth._id;
  if (!isOwner) {
    return res.status(403).json({ error: 'User is not authorized' });
  }
  next();
};

export default {
  create,
  shopByID,
  photo,
  defaultPhoto,
  list,
  listByOwner,
  read,
  update,
  isOwner,
  remove,
};
