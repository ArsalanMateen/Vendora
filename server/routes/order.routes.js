import express from 'express';

import userCtrl from '../controllers/user.controller.js';

import authCtrl from '../controllers/auth.controller.js';

import shopCtrl from '../controllers/shop.controller.js';

import orderCtrl from '../controllers/order.controller.js';

const router = express.Router();

router
  .route('/api/orders/:userId')
  .post(authCtrl.requireSignin, userCtrl.isSeller, authCtrl.hasAuthorization, orderCtrl.create);

router
  .route('/api/order/new/:userId')
  .post(authCtrl.requireSignin, authCtrl.hasAuthorization, orderCtrl.create);

router.param('userId', userCtrl.userByID);

router.param('shopId', shopCtrl.shopByID);

export default router;
