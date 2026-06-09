import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import socket from './auction-socket';
import auth from '../../auth/auth-helper';
import styles from './Auction.module.css';

export default function Bidding({ auction, justEnded, updateBids }) {
  const [bid, setBid] = useState('');
  const [bidError, setBidError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const active = useRef(false);

  useEffect(() => {
    active.current = true;

    return () => {
      active.current = false;
    };
  }, []);

  const jwt = auth.isAuthenticated();

  useEffect(() => {
    const receive = payload => {
      if (payload._id === auction._id) updateBids(payload);
    };

    socket.on('new bid', receive);

    return () => socket.off('new bid', receive);
  }, [auction._id, updateBids]);

  const handleChange = e => {
    setBid(e.target.value);
  };

  const placeBid = e => {
    e.preventDefault();
    if (!bid || !jwt || submitting) return;
    setSubmitting(true);
    setBidError('');

    const newBid = {
      bid: Number(bid),
      time: new Date(),
      bidder: jwt.user,
    };

    socket.timeout(8000).emit(
      'new bid',
      {
        room: auction._id,
        bidInfo: newBid,
      },
      (error, result) => {
        if (!active.current) return;
        setSubmitting(false);
        if (error || !result?.accepted)
          setBidError(result?.error || 'Could not place your bid. Please try again.');
        else setBid('');
      }
    );
  };

  const minBid =
    auction.bids && auction.bids.length > 0 ? auction.bids[0].bid : auction.startingBid || 0;

  const isAuctionLive =
    !justEnded && new Date() >= new Date(auction.bidStart) && new Date() < new Date(auction.bidEnd);

  return (
    <div>
      {isAuctionLive && (
        <div className={styles.bidForm}>
          <div className={styles.bidFormTitle}>Place Your Bid</div>
          {jwt ? (
            <form onSubmit={placeBid}>
              <div className={styles.bidInputGroup}>
                <input
                  id="bid"
                  aria-label="Your bid amount"
                  type="number"
                  placeholder={`Min: $${Number(minBid) + 1}`}
                  value={bid}
                  onChange={handleChange}
                  className={styles.bidInput}
                  min={Number(minBid) + 1}
                  step="1"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting || !bid || Number(bid) < Number(minBid) + 1}
                  className={styles.btnPlaceBid}
                >
                  Place Bid
                </button>
              </div>
              {bidError && <p role="alert">{bidError}</p>}
              <div className={styles.minBidHint}>
                Enter ${Number(minBid) + 1} or more to outbid the current price.
              </div>
            </form>
          ) : (
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              Please{' '}
              <Link to="/signin" style={{ color: '#4f46e5', fontWeight: 600 }}>
                Sign in
              </Link>{' '}
              to place your bid.
            </p>
          )}
        </div>
      )}

      <div className={styles.bidsHistory}>
        <div
          style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}
        >
          Bid history
        </div>
        {auction.bids && auction.bids.length > 0 ? (
          <table className={styles.bidsTable}>
            <thead>
              <tr>
                <th>Bid Amount</th>
                <th>Bidder</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {auction.bids.map((item, index) => (
                <tr key={index} style={index === 0 ? { background: '#f0fdf4' } : {}}>
                  <td className={styles.bidAmount}>
                    ${item.bid}{' '}
                    {index === 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>★ Highest</span>
                    )}
                  </td>
                  <td>{item.bidder?.name || 'Anonymous'}</td>
                  <td style={{ color: '#64748b' }}>{new Date(item.time).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={styles.noBids}>
            No bids placed yet. Be the first to bid! Starting at ${auction.startingBid || 0}.
          </div>
        )}
      </div>
    </div>
  );
}
