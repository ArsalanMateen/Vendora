import { Server } from 'socket.io';
import { auctionSummary } from '../helpers/auctionSummary.js';
import Auction from '../models/auction.model.js';
import { renewSampleAuction, sampleAuctionEvents } from '../helpers/sampleAuctionRenewal.js';

export default httpServer => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const announceRenewal = auction => {
    io.emit('auction summary', auctionSummary(auction));
    io.to(String(auction._id)).emit('auction renewed', auction);
  };

  sampleAuctionEvents.on('renewed', announceRenewal);
  httpServer.once('close', () => sampleAuctionEvents.off('renewed', announceRenewal));

  io.on('connection', socket => {
    socket.on('auction ended', async (data, acknowledge) => {
      if (typeof acknowledge !== 'function') return;
      if (
        !/^[a-f\d]{24}$/i.test(data?.auctionId || '') ||
        typeof data?.bidEnd !== 'string' ||
        !Number.isFinite(Date.parse(data.bidEnd))
      ) {
        return acknowledge({ error: 'Invalid auction expiry notification' });
      }
      try {
        const auction = await renewSampleAuction({
          auctionId: data.auctionId,
          expectedEnd: data.bidEnd,
        });
        acknowledge({ auction, serverTime: Date.now() });
      } catch {
        acknowledge({ error: 'Could not refresh auction' });
      }
    });
    socket.on('join auction room', data => {
      socket.join(data.room);
    });

    socket.on('leave auction room', data => {
      socket.leave(data.room);
    });

    socket.on('new bid', async (data, acknowledge) => {
      const result = await bid(data?.bidInfo, data?.room);
      if (typeof acknowledge === 'function') acknowledge(result);
    });
  });

  const bid = async (bidInfo, auctionId) => {
    try {
      if (
        !/^[a-f\d]{24}$/i.test(auctionId || '') ||
        !Number.isFinite(bidInfo?.bid) ||
        bidInfo.bid <= 0 ||
        !/^[a-f\d]{24}$/i.test(String(bidInfo?.bidder?._id || ''))
      )
        return { error: 'Please enter a valid bid.' };
      await renewSampleAuction({ auctionId });
      const now = new Date();
      let result = await Auction.findOneAndUpdate(
        {
          _id: auctionId,
          bidStart: { $lte: now },
          bidEnd: { $gt: now },
          $or: [{ 'bids.0.bid': { $lt: bidInfo.bid } }, { bids: { $eq: [] } }],
        },
        {
          $push: {
            bids: {
              $each: [{ bid: bidInfo.bid, bidder: bidInfo.bidder._id, time: now }],
              $position: 0,
            },
          },
        },
        { new: true }
      )
        .populate('bids.bidder', '_id name')
        .populate('seller', '_id name')
        .exec();

      if (result) {
        io.to(auctionId).emit('new bid', result);
        io.emit('auction summary', auctionSummary(result));
        return { accepted: true };
      }
      return {
        error:
          'Bidding has closed or a higher bid was received. Please review the current auction.',
      };
    } catch (err) {
      console.error('Error recording new bid:', err);
      return { error: 'Could not place your bid. Please try again.' };
    }
  };

  return io;
};
