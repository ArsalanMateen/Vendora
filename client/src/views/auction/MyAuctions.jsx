import useCursorList from '../../components/useCursorList';
import LoadBoundary from '../../components/LoadBoundary';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { listBySeller } from '../../api/api-auction.js';
import Auctions from './Auctions';
import styles from './Auction.module.css';

export default function MyAuctions() {
  const jwt = auth.isAuthenticated();

  const page = useCursorList(
    (cursor, signal) => listBySeller({ userId: jwt.user._id, cursor }, { t: jwt.token }, signal),
    jwt?.user?._id,
    'auctions'
  );

  const auctions = page.data;
  const loading = page.loading;

  const removeAuction = useCallback(auction => page.remove(auction._id), [page.remove]);

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.title}>Your Listed Auctions</h2>
        <Link to="/auction/new" className={styles.btnCreate}>
          + New Auction
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          Loading your auctions...
        </div>
      ) : page.error ? (
        <p role="alert">
          {page.error}
          <button onClick={page.retry}>Try again</button>
        </p>
      ) : (
        <Auctions auctions={auctions} removeAuction={removeAuction} />
      )}
      <LoadBoundary page={page} />
    </div>
  );
}
