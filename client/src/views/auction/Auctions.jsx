import AuctionCard from './AuctionCard';
import styles from './Auction.module.css';
export default function Auctions({
  auctions,
  removeAuction,
  onBoundary
}) {
  return !auctions.length ? <p>No auctions in this view.</p> : <div className={styles.auctionList}>
    {auctions.map(auction => <AuctionCard key={auction._id} auction={auction} removeAuction={removeAuction} onBoundary={onBoundary} />)}
  </div>;
}
