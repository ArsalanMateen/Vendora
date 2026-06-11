import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon';
import AuctionCard from './AuctionCard';
import styles from './Auction.module.css';
import socket from './auction-socket';
import useAuctionExpiry from './useAuctionExpiry';
import { summary, mergeSummary } from './auction-summary';

function Auctions({ auctions, removeAuction, onBoundary }) {
  const [updates, setUpdates] = useState({});

  const ids = useMemo(() => new Set(auctions.map(auction => auction._id)), [auctions]);

  const receive = useCallback(
    auction => {
      if (!ids.has(auction._id)) return;
      setUpdates(previous => {
        const existing = previous[auction._id];
        const next = existing ? mergeSummary(existing, auction) : summary(auction);

        return next === existing ? previous : { ...previous, [auction._id]: next };
      });
    },
    [ids]
  );

  const tracked = useMemo(
    () =>
      (auctions || [])
        .map(auction =>
          updates[auction._id] ? mergeSummary(auction, updates[auction._id]) : auction
        )
        .sort((a, b) => Date.parse(a.bidEnd) - Date.parse(b.bidEnd)),
    [auctions, updates]
  );

  useAuctionExpiry(tracked, receive);

  useEffect(() => {
    socket.on('auction summary', receive);

    return () => socket.off('auction summary', receive);
  }, [receive]);

  if (!auctions?.length)
    return (
      <div className="empty-state">
        <Icon name="gavel" size={34} />
        <h3>No auctions in this view</h3>
        <p>Try another filter, or come back for the next round of unique finds.</p>
        <Link to="/">Explore the collection</Link>
      </div>
    );

  return (
    <div className={styles.auctionList}>
      {tracked.map(auction => (
        <AuctionCard
          auction={auction}
          key={auction._id}
          removeAuction={removeAuction}
          onBoundary={onBoundary}
        />
      ))}
    </div>
  );
}

export default React.memo(Auctions);
