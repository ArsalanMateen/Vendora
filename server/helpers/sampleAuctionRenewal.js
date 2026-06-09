

import '../models/user.model.js';
export const SAMPLE_AUCTION_BATCH = 'vendora-final-marketplace-v1';

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

