import mongoose from 'mongoose';

const AuctionSchema = new mongoose.Schema({
  itemName: {
    type: String,
    trim: true,
    required: 'Item name is required',
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    default: '',
  },
  updated: Date,
  // Set by the catalog importer only; user-created auctions are not samples.
  seedBatch: String,
  created: {
    type: Date,
    default: Date.now,
  },
  bidStart: {
    type: Date,
    default: Date.now,
  },
  bidEnd: {
    type: Date,
    required: 'Auction end time is required',
  },
  seller: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  startingBid: { type: Number, default: 0 },
  bids: [
    {
      bidder: { type: mongoose.Schema.ObjectId, ref: 'User' },
      bid: Number,
      time: Date,
    },
  ],
});

// Only 24 auction records currently; defer extra seller/bidder indexes until growth warrants them.
export default mongoose.model('Auction', AuctionSchema);
