import { useEffect, useRef } from 'react';
import socket, { useAuctionSocket } from './auction-socket';
import { notifyAuctionEnded, SAMPLE_AUCTION_BATCH } from './sample-auction-renewal.js';

export default function useAuctionExpiry(auctions, onRenewed) {
  useAuctionSocket();

  const callback = useRef(onRenewed);

  callback.current = onRenewed;

  const latest = useRef(auctions);

  latest.current = auctions;
  const windows = auctions
    .filter(auction => auction.seedBatch === SAMPLE_AUCTION_BATCH)
    .map(auction => `${auction._id}:${auction.bidEnd}`)
    .sort()
    .join('|');

  useEffect(() => {
    let active = true;
    const timers = new Set();

    const schedule = (auction, serverTime = Date.now()) => {
      const end = new Date(auction.bidEnd).getTime();
      if (!Number.isFinite(end) || auction.seedBatch !== SAMPLE_AUCTION_BATCH) return;
      const delay = Math.max(0, end - serverTime + 100);
      const timer = setTimeout(
        async () => {
          timers.delete(timer);
          if (!active) return;
          // Long auction windows need another one-shot timeout before expiry.
          if (delay > 2147483647) return schedule(auction);
          const result = await notifyAuctionEnded(socket, auction);
          if (!active || !result?.auction) return;
          const updated = result.auction;
          if (new Date(updated.bidEnd).getTime() > end) callback.current?.(updated);
          else if (
            updated.seedBatch === SAMPLE_AUCTION_BATCH &&
            new Date(updated.bidEnd) > new Date(updated.bidStart)
          ) {
            // The server clock wins if a visitor's computer clock runs ahead.
            schedule(updated, result.serverTime);
          }
        },
        Math.min(delay, 2147483647)
      );
      timers.add(timer);
    };

    const start = () => {
      timers.forEach(clearTimeout);
      timers.clear();
      latest.current.forEach(auction => schedule(auction));
    };

    start();
    socket.on('connect', start);

    return () => {
      active = false;
      timers.forEach(clearTimeout);
      socket.off('connect', start);
    };
  }, [windows]);
}
