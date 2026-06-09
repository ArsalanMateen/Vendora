export const SAMPLE_AUCTION_BATCH = 'vendora-final-marketplace-v1';
const pending = new Map();

export function notifyAuctionEnded(socket, auction) {
  if (auction.seedBatch !== SAMPLE_AUCTION_BATCH || !socket.connected) return Promise.resolve(null);
  const key = `${auction._id}:${auction.bidEnd}`;
  if (pending.has(key)) return pending.get(key);
  const request = new Promise(resolve => {
    socket
      .timeout(10000)
      .emit(
        'auction ended',
        { auctionId: auction._id, bidEnd: auction.bidEnd },
        (error, result) => {
          resolve(error || result?.error ? null : result);
        }
      );
  });
  pending.set(key, request);
  request.finally(() => pending.delete(key));

  return request;
}
