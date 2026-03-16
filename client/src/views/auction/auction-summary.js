export function summary(auction) {
  return Object.fromEntries(
    [
      "_id",
      "itemName",
      "image",
      "seller",
      "startingBid",
      "bidStart",
      "bidEnd",
      "seedBatch",
      "created",
    ]
      .map((key) => [key, auction[key]])
      .concat([
        ["bidCount", auction.bidCount ?? auction.bids?.length ?? 0],
        [
          "currentBid",
          auction.currentBid ??
            Math.max(
              auction.startingBid || 0,
              ...(auction.bids || []).map((item) => item.bid),
            ),
        ],
      ]),
  );
}
export function mergeSummary(previous, update) {
  if (new Date(update.bidEnd) < new Date(previous.bidEnd)) return previous;
  if (
    new Date(update.bidEnd).getTime() === new Date(previous.bidEnd).getTime() &&
    update.bidCount <= previous.bidCount &&
    update.currentBid <= previous.currentBid
  )
    return previous;

  return update.bids ? summary(update) : update;
}
