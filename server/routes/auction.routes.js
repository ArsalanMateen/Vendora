import express from 'express';

import userCtrl from '../controllers/user.controller.js';



import auctionCtrl from '../controllers/auction.controller.js';

const router = express.Router();

router.route('/api/auctions/counts').get(auctionCtrl.counts);

router.route('/api/auctions').get(auctionCtrl.listOpen);

router.route('/api/auctions/bid/:userId').get(auctionCtrl.listByBidder);

router.route('/api/auction/:auctionId').get(auctionCtrl.read);

router.param('auctionId', auctionCtrl.auctionByID);

router.param('userId', userCtrl.userByID);

export default router;
