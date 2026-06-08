import { useEffect } from 'react';

import socket from './auction-socket';

import styles from './Auction.module.css';

export default function Bidding({ auction, justEnded, updateBids }) {
  
  
  

  



  

  useEffect(() => {
    const receive = payload => {
      if (payload._id === auction._id) updateBids(payload);
    };

    socket.on('new bid', receive);

    return () => socket.off('new bid', receive);
  }, [auction._id, updateBids]);

  

  

  

  

  return (
    <div>
      

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
