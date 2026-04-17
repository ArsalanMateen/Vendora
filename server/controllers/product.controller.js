
import Product from '../models/product.model.js';
import { productPage } from '../helpers/productPagination.js';




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

const read = (req, res) => {
  return res.json(req.product);
};

const listByShop = async (req, res) => {
  try {
    res.json(await productPage(Product, req.query, req.shop._id));
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

export default { list, listByShop, productByID, read };
