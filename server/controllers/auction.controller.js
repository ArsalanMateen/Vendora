import { listQuery, listResult } from '../helpers/listPagination.js';
import Auction from '../models/auction.model.js';
import { auctionProjection } from '../helpers/auctionSummary.js';
import extend from 'lodash/extend.js';
import errorHandler from '../helpers/dbErrorHandler.js';
import formidable from 'formidable';
import { uploadAuctionImage, deleteImage } from '../helpers/r2.js';
import { renewSampleAuction, renewSampleAuctions } from '../helpers/sampleAuctionRenewal.js';

const create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Image could not be uploaded',
      });
    }
    let auction = new Auction(fields);
    auction.seedBatch = undefined;
    auction.seller = req.profile;
    try {
      if (files.image) {
        auction.image = await uploadAuctionImage(files.image, auction._id);
      }
      let result = await auction.save();
      res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err),
      });
    }
  });
};

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

const photo = (req, res, next) => {
  if (req.auction && req.auction.image) {
    if (typeof req.auction.image === 'string' && req.auction.image.startsWith('http')) {
      return res.redirect(302, req.auction.image);
    }
    if (req.auction.image.data) {
      res.set('Content-Type', req.auction.image.contentType);
      return res.send(req.auction.image.data);
    }
  }
  next();
};

const defaultPhoto = (req, res) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#f8fafc"/>
    <g fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(140, 140) scale(4)">
      <path d="M14 13l4 4L7 28l-4-4L14 13z"/>
      <path d="M11 16l4-4"/>
      <path d="M16 11l2-2a2 2 0 0 1 2.83 0l1.17 1.17a2 2 0 0 1 0 2.83L20 15"/>
    </g>
  </svg>`;
  res.set('Content-Type', 'image/svg+xml');

  return res.send(svg);
};

const read = async (req, res) => {
  try {
    return res.json(await renewSampleAuction({ auction: req.auction }));
  } catch {
    return res.status(500).json({ error: 'Could not retrieve auction' });
  }
};

const update = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Photo could not be uploaded',
      });
    }
    let auction = req.auction;
    // The importer marker cannot be added or replaced through a public form.
    const { seedBatch, ...editableFields } = fields;
    auction = extend(auction, editableFields);
    auction.updated = Date.now();
    try {
      if (files.image) {
        if (
          auction.image &&
          typeof auction.image === 'string' &&
          auction.image.startsWith('http')
        ) {
          await deleteImage(auction.image);
        }
        auction.image = await uploadAuctionImage(files.image, auction._id);
      }
      let result = await auction.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({
        error: errorHandler.getErrorMessage(err),
      });
    }
  });
};

const remove = async (req, res) => {
  try {
    let auction = req.auction;
    if (auction.image && typeof auction.image === 'string' && auction.image.startsWith('http')) {
      await deleteImage(auction.image);
    }
    let deletedAuction = await auction.remove();
    res.json(deletedAuction);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

const listOpen = async (req, res) => {
  try {
    const filter = {};
    const query = listQuery(req.query, filter, 'bidEnd', 1);
    await renewSampleAuctions();
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
    await renewSampleAuctions({ filter: { seller: req.profile._id } });
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
    await renewSampleAuctions({ filter: { 'bids.bidder': req.profile._id } });
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

export default {
  counts,
  create,
  auctionByID,
  photo,
  defaultPhoto,
  listOpen,
  listBySeller,
  listByBidder,
  read,
  update,
  isSeller,
  remove,
};
