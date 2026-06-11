import { useMemo, useState, useEffect, useCallback } from 'react';
import { listOpen, counts } from '../../api/api-auction';
import useCursorList from '../../components/useCursorList';
import LoadBoundary from '../../components/LoadBoundary';
import { ProductSkeletons } from '../../components/ProductCard';
import Icon from '../../components/Icon';
import Auctions from './Auctions';
import styles from './Auction.module.css';
import socket, { useAuctionSocket } from './auction-socket';
import { SAMPLE_AUCTION_BATCH } from './sample-auction-renewal';
import { mergeSummary } from './auction-summary';

export default function OpenAuctions() {
  const page = useCursorList((cursor, signal) => listOpen(signal, { cursor }), 'open', 'auctions');
  useAuctionSocket();

  const { data, loading, error, retry } = page;

  const [removed, setRemoved] = useState([]);
  const [boundary, setBoundary] = useState(0);
  const [renewed, setRenewed] = useState({});
  const [liveCount, setLiveCount] = useState(null);
  const [countsRevision, setCountsRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      () =>
        counts(controller.signal)
          .then(data => {
            if (!controller.signal.aborted) setLiveCount(data.liveCount);
          })
          .catch(() => {}),
      100
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [countsRevision, page.totalCount]);

  useEffect(() => {
    const update = auction => {
      setRenewed(previous => ({
        ...previous,
        [auction._id]: previous[auction._id]
          ? mergeSummary(previous[auction._id], auction)
          : auction,
      }));
      if (
        auction.seedBatch === SAMPLE_AUCTION_BATCH &&
        Date.parse(auction.bidStart) > Date.now() - 5000
      )
        setCountsRevision(value => value + 1);
    };

    socket.on('auction summary', update);
    socket.on('connect', page.refresh);

    return () => {
      socket.off('auction summary', update);
      socket.off('connect', page.refresh);
    };
  }, [page.refresh]);

  const tracked = useMemo(() => {
    const merged = new Map(data.map(auction => [auction._id, auction]));
    Object.values(renewed).forEach(auction => {
      const existing = merged.get(auction._id);
      if (existing) merged.set(auction._id, mergeSummary(existing, auction));
    });

    return [...merged.values()].filter(auction => !removed.includes(auction._id));
  }, [data, renewed, removed]);

  const auctions = useMemo(
    () =>
      [...tracked]
        .filter(
          auction =>
            auction.seedBatch === SAMPLE_AUCTION_BATCH || Date.parse(auction.bidEnd) > Date.now()
        )
        .sort((a, b) => Date.parse(a.bidEnd) - Date.parse(b.bidEnd)),
    [tracked, boundary]
  );

  const live = auctions.filter(
    auction => Date.parse(auction.bidStart) <= Date.now() && Date.parse(auction.bidEnd) > Date.now()
  );

  const removeAuction = useCallback(
    auction => setRemoved(previous => [...previous, auction._id]),
    []
  );

  const onBoundary = useCallback(() => {
    setBoundary(value => value + 1);
    setCountsRevision(value => value + 1);
  }, []);

  return (
    <div className={styles.container}>
      <p className="page-kicker">THE AUCTION ROOM</p>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>A find worth bidding for.</h1>
          <p className="page-description">
            Discover unique listings and follow the excitement, one bid at a time.
          </p>
        </div>
        {!loading && !error && (
          <span className={styles.livePill}>
            <span />
            {liveCount ?? live.length} live{' '}
            {(liveCount ?? live.length) === 1 ? 'auction' : 'auctions'}
          </span>
        )}
      </div>
      {loading ? (
        <ProductSkeletons count={6} />
      ) : error ? (
        <div className="empty-state">
          <Icon name="gavel" size={34} />
          <h3>The auction room needs a moment</h3>
          <p>{error}</p>
          <button onClick={retry}>Try again</button>
        </div>
      ) : (
        <Auctions auctions={auctions} removeAuction={removeAuction} onBoundary={onBoundary} />
      )}
      <LoadBoundary page={page} />
    </div>
  );
}
