import express from 'express';

import productCtrl from '../controllers/product.controller.js';



import shopCtrl from '../controllers/shop.controller.js';

const router = express.Router();

router.route('/api/products').get(productCtrl.list);

router.route('/api/products/:productId').get(productCtrl.read);

router.param('shopId', shopCtrl.shopByID);

router.param('productId', productCtrl.productByID);

export default router;
