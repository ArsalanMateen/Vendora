export const auctionProjection = {
  _id: 1,
  itemName: 1,
  image: 1,
  seller: 1,
  startingBid: 1,
  bidStart: 1,
  bidEnd: 1,
  seedBatch: 1,
  created: 1,
  bidCount: { $size: { $ifNull: ['$bids', []] } },
  currentBid: { $max: { $concatArrays: [['$startingBid'], { $ifNull: ['$bids.bid', []] }] } },
};
export function auctionSummary(auction) {
  const plain = auction.toObject ? auction.toObject() : auction;

  return Object.fromEntries(
    [
      '_id',
      'itemName',
      'image',
      'seller',
      'startingBid',
      'bidStart',
      'bidEnd',
      'seedBatch',
      'created',
    ]
      .map(key => [key, plain[key]])
      .concat([
        ['bidCount', plain.bidCount ?? plain.bids?.length ?? 0],
        [
          'currentBid',
          plain.currentBid ??
            Math.max(plain.startingBid || 0, ...(plain.bids || []).map(item => item.bid)),
        ],
      ])
  );
}
