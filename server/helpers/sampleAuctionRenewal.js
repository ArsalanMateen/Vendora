import { EventEmitter } from 'node:events';
import Auction from '../models/auction.model.js';
import '../models/user.model.js';

export const SAMPLE_AUCTION_BATCH = 'vendora-final-marketplace-v1';
export const sampleAuctionEvents = new EventEmitter();

export function nextSampleWindow(auction, now) {
  if (auction.seedBatch !== SAMPLE_AUCTION_BATCH) return null;
  const start = new Date(auction.bidStart).getTime();
  const end = new Date(auction.bidEnd).getTime();
  const current = new Date(now).getTime();
  const duration = end - start;
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(current) || end > current)
    return null;

  return { bidStart: new Date(current), bidEnd: new Date(current + duration) };
}

async function saveRenewal(auction, now, model) {
  const window = nextSampleWindow(auction, now);
  if (!window) return null;
  const saved = await model
    .findOneAndUpdate(
      {
        _id: auction._id,
        seedBatch: SAMPLE_AUCTION_BATCH,
        bidStart: auction.bidStart,
        bidEnd: auction.bidEnd,
      },
      { $set: window },
      { new: true }
    )
    .populate('seller', '_id name')
    .populate('bids.bidder', '_id name')
    .exec();
  if (saved) sampleAuctionEvents.emit('renewed', saved);

  return saved;
}

export async function renewSampleAuction({
  auctionId,
  expectedEnd,
  auction,
  now,
  model = Auction,
} = {}) {
  const load = () =>
    model
      .findById(auctionId || auction._id)
      .populate('seller', '_id name')
      .populate('bids.bidder', '_id name')
      .exec();

  const current = auction || (await load());
  if (!current) return null;
  const renewalTime = now || new Date();
  if (expectedEnd && new Date(expectedEnd).getTime() !== new Date(current.bidEnd).getTime())
    return current;
  if (!nextSampleWindow(current, renewalTime)) return current;

  // Only one client or server replica can replace this exact auction window.
  return (await saveRenewal(current, renewalTime, model)) || (await load());
}

export async function renewSampleAuctions({ now = new Date(), model = Auction, filter = {} } = {}) {
  const expired = await model
    .find({ ...filter, seedBatch: SAMPLE_AUCTION_BATCH, bidEnd: { $lte: now } })
    .select('_id seedBatch bidStart bidEnd')
    .lean()
    .exec();
  const renewed = [];
  for (const auction of expired) {
    const saved = await saveRenewal(auction, now, model);
    if (saved) {
      renewed.push(saved);
    }
  }

  return renewed;
}
