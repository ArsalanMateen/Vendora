import Shop from '../models/shop.model.js';
import errorHandler from '../helpers/dbErrorHandler.js';


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

export default { shopByID, read, list, listByOwner, isOwner };
