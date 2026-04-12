import Shop from '../models/shop.model.js';
import errorHandler from '../helpers/dbErrorHandler.js';
import formidable from 'formidable';

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

const read = (req, res) => {
  return res.json(req.shop);
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

export default { shopByID, read, list, listByOwner, isOwner, create };
