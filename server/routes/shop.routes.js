import express from 'express';

import userCtrl from '../controllers/user.controller.js';



import shopCtrl from '../controllers/shop.controller.js';

const router = express.Router();

router.route('/api/shops').get(shopCtrl.list);

router.param('shopId', shopCtrl.shopByID);

router.param('userId', userCtrl.userByID);

export default router;
