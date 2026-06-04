import express from 'express';

import userCtrl from '../controllers/user.controller.js';

import authCtrl from '../controllers/auth.controller.js';

import auctionCtrl from '../controllers/auction.controller.js';

const router = express.Router();

router.route('/api/auctions/counts').get(auctionCtrl.counts);

router.route('/api/auctions').get(auctionCtrl.listOpen);

router.route('/api/auctions/bid/:userId').get(auctionCtrl.listByBidder);

router.route('/api/auction/:auctionId').get(auctionCtrl.read);

router
  .route('/api/auctions/by/:userId')
  .post(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.isSeller, auctionCtrl.create)
  .get(authCtrl.requireSignin, authCtrl.hasAuthorization, auctionCtrl.listBySeller);

router.param('auctionId', auctionCtrl.auctionByID);

router.param('userId', userCtrl.userByID);

export default router;
