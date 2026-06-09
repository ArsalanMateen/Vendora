import { listOpen } from '../../api/api-auction';
import useCursorList from '../../components/useCursorList';
import LoadBoundary from '../../components/LoadBoundary';
import { useAuctionSocket } from './auction-socket';
import Auctions from './Auctions';
import styles from './Auction.module.css';
export default function OpenAuctions() {
  useAuctionSocket();
  const page = useCursorList((cursor, signal) => listOpen(signal, {
    cursor
  }), 'open', 'auctions');
  return <div className={styles.container}>
    <h1>A find worth bidding for.</h1>
    {page.loading ? <p>Loading auctions</p> : page.error ? <p role="alert">
      {page.error}
      <button onClick={page.retry}>Try again</button>
    </p> : <Auctions auctions={page.data} />}
    <LoadBoundary page={page} />
  </div>;
}
