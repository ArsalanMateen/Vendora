
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import Icon from '../../components/Icon';
import { ProductImage, formatPrice } from '../../components/ProductCard';

import styles from './Auction.module.css';
import AuctionCountdown from './AuctionCountdown';

const phase = auction =>
  Date.now() >= Date.parse(auction.bidEnd)
    ? 'ended'
    : Date.now() < Date.parse(auction.bidStart)
      ? 'upcoming'
      : 'live';

function AuctionCard({ auction, removeAuction, onBoundary }) {
  

  const [status, setStatus] = useState(() => phase(auction));

  const statusRef = useRef(status);

  statusRef.current = status;

  const callbacks = useRef({ onBoundary });

  callbacks.current = { onBoundary };
  const auctionWindow = `${auction.bidStart}:${auction.bidEnd}`;

  useEffect(() => {
    if (statusRef.current !== phase(auction)) setStatus(phase(auction));
    let timer;
    const start = Date.parse(auction.bidStart);

    const schedule = () => {
      const remaining = start - Date.now();
      if (remaining > 0) timer = setTimeout(schedule, Math.min(remaining + 5, 2147483647));
      else {
        setStatus(phase(auction));
        callbacks.current.onBoundary?.(auction, 'start');
      }
    };

    if (Date.now() < start) schedule();

    return () => clearTimeout(timer);
  }, [auctionWindow]);

  const ended = status === 'ended',
    upcoming = status === 'upcoming';
  const bidCount = auction.bidCount ?? auction.bids?.length ?? 0;
  const highestBid =
    auction.currentBid ??
    (auction.bids?.length
      ? Math.max(...auction.bids.map(item => Number(item.bid)))
      : auction.startingBid);
  

  return (
    <article className={styles.auctionTile}>
      <Link to={`/auction/${auction._id}`} className={styles.auctionTileImage}>
        <ProductImage
          product={{
            ...auction,
            name: auction.itemName,
            image: auction.image || `/api/auctions/image/${auction._id}`,
          }}
          className={styles.auctionTilePhoto}
        />
      </Link>
      <div className={styles.auctionTileBody}>
        <Link to={`/auction/${auction._id}`} className={styles.listTitle}>
          {auction.itemName}
        </Link>
        <div className={styles.auctionTileMeta}>
          {auction.seller?.name && (
            <p className={styles.auctionSeller}>Listed by {auction.seller.name}</p>
          )}
          <span
            className={`${styles.auctionStatus} ${ended ? styles.statusEnded : upcoming ? styles.statusPending : styles.statusLive}`}
          >
            {ended ? 'Ended' : upcoming ? 'Upcoming' : 'Live now'}
          </span>
        </div>
        <div className={styles.auctionTilePrice}>
          <span>
            <small>{bidCount ? 'CURRENT BID' : 'STARTING BID'}</small>
            <strong>{formatPrice(highestBid)}</strong>
          </span>
          <span>{bidCount} bids</span>
        </div>
        <div className={styles.auctionTileTime}>
          <Icon name="clock" size={14} />
          {upcoming ? (
            <span>
              Starts{' '}
              {new Date(auction.bidStart).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}{' '}
              at{' '}
              {new Date(auction.bidStart).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          ) : (
            <AuctionCountdown
              endTime={auction.bidEnd}
              onEnd={() => {
                setStatus('ended');
                callbacks.current.onBoundary?.(auction, 'end');
              }}
            />
          )}
        </div>
        <div className={styles.listActions}>
          <Link to={`/auction/${auction._id}`} className={`${styles.btnAction} ${styles.btnView}`}>
            {ended ? 'View results' : upcoming ? 'View auction' : 'Join the bidding'}
          </Link>

        </div>
      </div>
    </article>
  );
}

export default React.memo(AuctionCard);
