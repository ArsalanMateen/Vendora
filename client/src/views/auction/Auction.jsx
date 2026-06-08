import BackLink from '../../components/BackLink';
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { read } from '../../api/api-auction.js';

import Timer from './Timer';
import Bidding from './Bidding';
import { ProductImage, formatPrice } from '../../components/ProductCard';
import Icon from '../../components/Icon';
import styles from './Auction.module.css';
import socket from './auction-socket';


export default function Auction() {
  const { auctionId } = useParams();

  const [auction, setAuction] = useState(null);
  const [error, setError] = useState('');
  const [justEnded, setJustEnded] = useState(false);

  



  useEffect(() => {
    if (!auction) return;
    const start = Date.parse(auction.bidStart);
    if (start <= Date.now()) return;
    let timer;
    const controller = new AbortController();

    const schedule = () => {
      const remaining = start - Date.now();
      if (remaining > 0) timer = setTimeout(schedule, Math.min(remaining + 5, 2147483647));
      else
        read({ auctionId }, controller.signal).then(data => {
          if (!controller.signal.aborted && data && !data.error) setAuction(data);
        });
    };

    schedule();

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [auctionId, auction?.bidStart]);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    const signal = abortController.signal;
    setAuction(null);
    setError('');
    setJustEnded(false);

    const load = () =>
      read({ auctionId }, signal).then(data => {
        if (!isMounted) return;
        if (data && !data.error) {
          setAuction(data);
          setJustEnded(false);
        } else if (data?.error) {
          setError(data.error);
        } else {
          setError('We couldn’t load this auction. Please try again.');
        }
      });

    const renewed = data => {
      if (data._id === auctionId && isMounted) {
        setAuction(data);
        setJustEnded(false);
      }
    };

    const join = () => socket.emit('join auction room', { room: auctionId });

    join();
    socket.on('connect', join);
    void load();
    socket.on('auction renewed', renewed);
    socket.on('connect', load);

    return () => {
      isMounted = false;
      abortController.abort();
      socket.off('auction renewed', renewed);
      socket.off('connect', load);
      socket.off('connect', join);
      socket.emit('leave auction room', { room: auctionId });
    };
  }, [auctionId]);

  const updateBids = useCallback(updatedAuction => setAuction(updatedAuction), []);

  const update = () => {
    setJustEnded(true);
  };

  if (!auction) {
    return (
      <div className={styles.container}>
        {error ? (
          <div className="empty-state">
            <Icon name="gavel" size={34} />
            <h3>This auction needs a moment</h3>
            <p>{error}</p>
            <Link to="/auctions/all">Explore auctions</Link>
          </div>
        ) : (
          <div className={styles.noBids}>Loading auction details…</div>
        )}
      </div>
    );
  }

  const imageUrl =
    auction.image ||
    (auction._id ? `/api/auctions/image/${auction._id}` : '/api/auctions/defaultphoto');

  const currentDate = new Date();
  const isPending = currentDate < new Date(auction.bidStart);
  const isLive =
    currentDate >= new Date(auction.bidStart) &&
    currentDate < new Date(auction.bidEnd) &&
    !justEnded;
  const isEnded = currentDate >= new Date(auction.bidEnd) || justEnded;

  const highestBid =
    auction.bids && auction.bids.length > 0 ? auction.bids[0].bid : auction.startingBid || 0;

  return (
    <div className={styles.container}>
      <BackLink to="/auctions/all">Back to auctions</BackLink>
      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.card}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>{auction.itemName}</h1>
            <div className={styles.sellerText}>
              Listed by: <strong>{auction.seller?.name || 'Seller'}</strong>
            </div>
          </div>
          <div>
            {isPending && (
              <span className={`${styles.auctionStatus} ${styles.statusPending}`}>Upcoming</span>
            )}
            {isLive && (
              <span className={`${styles.auctionStatus} ${styles.statusLive}`}>Live now</span>
            )}
            {isEnded && (
              <span className={`${styles.auctionStatus} ${styles.statusEnded}`}>Ended</span>
            )}
          </div>
        </div>

        <div className={styles.auctionGrid}>
          <div>
            <div className={styles.imageBox}>
              <ProductImage
                product={{ ...auction, name: auction.itemName, image: imageUrl }}
                className={styles.image}
                loading="eager"
              />
            </div>
            <h4 className={styles.sectionHeading}>About Item</h4>
            {auction.description && <p className={styles.description}>{auction.description}</p>}
          </div>

          <div>
            {auction.bidEnd && <Timer endTime={auction.bidEnd} update={update} />}

            <div className={styles.highestBidBanner}>
              <div>
                <div className={styles.highestBidLabel}>
                  {auction.bids?.length > 0 ? 'Current Highest Bid' : 'Starting Bid Price'}
                </div>
                <div className={styles.highestBidAmount}>{formatPrice(highestBid)}</div>
              </div>
              {isEnded && auction.bids?.length > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                    WINNER
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    {auction.bids[0].bidder?.name || 'Bidder'}
                  </div>
                </div>
              )}
            </div>

            {isPending && (
              <div className={styles.upcomingNotice}>
                Auction begins on {new Date(auction.bidStart).toLocaleString()}
              </div>
            )}

            {(isLive || isEnded) && (
              <Bidding auction={auction} justEnded={justEnded} updateBids={updateBids} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
