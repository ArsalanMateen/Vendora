import { listQuery, listResult } from '../helpers/listPagination.js';
import Auction from '../models/auction.model.js';
import { auctionProjection } from '../helpers/auctionSummary.js';

import errorHandler from '../helpers/dbErrorHandler.js';



const auctionByID = async (req, res, next, id) => {
  try {
    let query = Auction.findById(id)
      .populate('seller', '_id name')
      .populate('bids.bidder', '_id name');
    if (req.method === 'GET')
      query = query
        .select(
          '_id itemName description image bidStart bidEnd seller startingBid bids seedBatch created'
        )
        .lean();
    let auction = await query.exec();
    if (!auction)
      return res.status(400).json({
        error: 'Auction not found',
      });
    req.auction = auction;
    next();
  } catch (err) {
    return res.status(400).json({
      error: 'Could not retrieve auction',
    });
  }
};

const read = async (req, res) => {
  try {
    return res.json(req.auction);
  } catch {
    return res.status(500).json({ error: 'Could not retrieve auction' });
  }
};

const listOpen = async (req, res) => {
  try {
    const filter = {};
    const query = listQuery(req.query, filter, 'bidEnd', 1);
    const [rows, totalCount] = await Promise.all([
      Auction.aggregate([
        { $match: { $and: [query.pageFilter, { bidEnd: { $gt: new Date() } }] } },
        { $sort: query.sort },
        { $limit: query.limit + 1 },
        { $project: auctionProjection },
      ]),
      Auction.countDocuments({ bidEnd: { $gt: new Date() } }),
    ]);
    const auctions = await Auction.populate(rows, { path: 'seller', select: '_id name' });
    res.json(listResult(auctions, totalCount, query, 'auctions'));
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const counts = async (req, res) => {
  const now = new Date();
  try {
    const [totalCount, liveCount] = await Promise.all([
      Auction.countDocuments({ bidEnd: { $gt: now } }),
      Auction.countDocuments({ bidStart: { $lte: now }, bidEnd: { $gt: now } }),
    ]);
    res.json({ totalCount, liveCount });
  } catch {
    res.status(500).json({ error: 'Could not load auction counts' });
  }
};

const listBySeller = async (req, res) => {
  try {
    const filter = { seller: req.profile._id };
    const query = listQuery(req.query, filter, 'bidEnd', 1);
    const [rows, totalCount] = await Promise.all([
      Auction.aggregate([
        { $match: query.pageFilter },
        { $sort: query.sort },
        { $limit: query.limit + 1 },
        { $project: auctionProjection },
      ]),
      Auction.countDocuments({ seller: req.profile._id }),
    ]);
    const auctions = await Auction.populate(rows, { path: 'seller', select: '_id name' });
    res.json(listResult(auctions, totalCount, query, 'auctions'));
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const listByBidder = async (req, res) => {
  try {
    const filter = { 'bids.bidder': req.profile._id };
    const query = listQuery(req.query, filter, 'bidEnd', 1);
    const [rows, totalCount] = await Promise.all([
      Auction.aggregate([
        { $match: query.pageFilter },
        { $sort: query.sort },
        { $limit: query.limit + 1 },
        { $project: auctionProjection },
      ]),
      Auction.countDocuments({ 'bids.bidder': req.profile._id }),
    ]);
    const auctions = await Auction.populate(rows, { path: 'seller', select: '_id name' });
    res.json(listResult(auctions, totalCount, query, 'auctions'));
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const isSeller = (req, res, next) => {
  const isSeller =
    req.auction && req.auth && req.auction.seller._id.toString() === req.auth._id.toString();
  if (!isSeller) {
    return res.status(403).json({
      error: 'User is not authorized',
    });
  }
  next();
};

export default { auctionByID, read, listOpen, counts, listBySeller, listByBidder, isSeller };
