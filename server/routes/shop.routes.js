import express from 'express';

import userCtrl from '../controllers/user.controller.js';

import authCtrl from '../controllers/auth.controller.js';

import shopCtrl from '../controllers/shop.controller.js';

const router = express.Router();

router.route('/api/shops').get(shopCtrl.list);

router
  .route('/api/shops/by/:userId')
  .post(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.isSeller, shopCtrl.create)
  .get(authCtrl.requireSignin, authCtrl.hasAuthorization, shopCtrl.listByOwner);

router.param('shopId', shopCtrl.shopByID);

router.param('userId', userCtrl.userByID);

export default router;
