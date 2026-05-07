import { productIds } from '../helpers/batchProducts.js';
import Product from '../models/product.model.js';
import { productPage, productQuery, CARD_FIELDS } from '../helpers/productPagination.js';
import pkg from 'lodash';
const { extend } = pkg;
import errorHandler from '../helpers/dbErrorHandler.js';
import formidable from 'formidable';
import { uploadProductImage, deleteImage } from '../helpers/r2.js';

const create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: 'Image could not be uploaded' });
    }
    let product = new Product(fields);
    product.shop = req.shop;
    try {
      if (files.image) {
        product.image = await uploadProductImage(files.image, product._id);
      }
      let result = await product.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
    }
  });
};

const productByID = async (req, res, next, id) => {
  try {
    let query = Product.findById(id).populate('shop', '_id name');
    if (req.method === 'GET')
      query = query
        .select('_id name description price category quantity image shop created')
        .lean();
    let product = await query.exec();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    req.product = product;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Could not retrieve product' });
  }
};

const photo = (req, res, next) => {
  if (req.product && req.product.image) {
    if (typeof req.product.image === 'string' && req.product.image.startsWith('http')) {
      return res.redirect(302, req.product.image);
    }
    if (req.product.image.data) {
      res.set('Content-Type', req.product.image.contentType);
      return res.send(req.product.image.data);
    }
  }
  next();
};

const defaultPhoto = (req, res) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#f8fafc"/>
    <g fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(140, 140) scale(5)">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </g>
  </svg>`;
  res.set('Content-Type', 'image/svg+xml');

  return res.send(svg);
};

const read = (req, res) => {
  return res.json(req.product);
};

const update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ message: 'Photo could not be uploaded' });
    }
    let product = req.product;
    product = extend(product, fields);
    product.updated = Date.now();
    try {
      if (files.image) {
        if (
          product.image &&
          typeof product.image === 'string' &&
          product.image.startsWith('http')
        ) {
          await deleteImage(product.image);
        }
        product.image = await uploadProductImage(files.image, product._id);
      }
      let result = await product.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
    }
  });
};

const remove = async (req, res) => {
  try {
    let product = req.product;
    if (product.image && typeof product.image === 'string' && product.image.startsWith('http')) {
      await deleteImage(product.image);
    }
    let deletedProduct = await Product.findByIdAndDelete(product._id);
    res.json(deletedProduct);
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const listByShop = async (req, res) => {
  try {
    res.json(await productPage(Product, req.query, req.shop._id));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const listLatest = async (req, res) => {
  try {
    let products = await Product.find({})
      .sort('-created')
      .limit(8)
      .select(CARD_FIELDS)
      .lean()
      .populate('shop', '_id name');
    res.json(products);
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const listRelated = async (req, res) => {
  try {
    let products = await Product.find({
      _id: { $ne: req.product._id },
      category: req.product.category,
    })
      .limit(6)
      .select(CARD_FIELDS)
      .lean()
      .populate('shop', '_id name');
    res.json(products);
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) });
  }
};

const listCategories = async (req, res) => {
  try {
    const shop = req.query.shopId;
    if (shop && !/^[a-f\d]{24}$/i.test(shop)) throw new Error('Invalid shopId');
    const { filter } = productQuery(
      req.query,
      shop ? Product.schema.path('shop').cast(shop) : undefined
    );
    const [categories, totalCount] = await Promise.all([
      Product.aggregate([
        ...(shop ? [{ $match: { shop: Product.schema.path('shop').cast(shop) } }] : []),
        { $group: { _id: '$category', count: { $sum: 1 }, shopIds: { $addToSet: '$shop' } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, name: '$_id', count: 1, shopIds: 1 } },
      ]),
      Product.countDocuments(filter),
    ]);
    res.json({ categories, totalCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const list = async (req, res) => {
  try {
    res.json(await productPage(Product, req.query));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const batch = async (req, res) => {
  try {
    const ids = productIds(req.body?.ids);
    if (!ids.length) return res.json({ products: [] });
    const products = await Product.find({ _id: { $in: ids } })
      .select(CARD_FIELDS)
      .populate('shop', '_id name')
      .lean();
    const found = new Map(products.map(product => [String(product._id), product]));
    res.json({ products: ids.map(id => found.get(id)).filter(Boolean) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default {
  batch,
  create,
  productByID,
  photo,
  defaultPhoto,
  read,
  update,
  remove,
  listByShop,
  listLatest,
  listRelated,
  listCategories,
  list,
};
