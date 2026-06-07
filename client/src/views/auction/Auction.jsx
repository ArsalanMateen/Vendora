import BackLink from '../../components/BackLink';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { read } from '../../api/api-auction.js';
import { ProductImage } from '../../components/ProductCard';
import Icon from '../../components/Icon';
import styles from './Auction.module.css';
export default function Auction() {
  const {
    auctionId
  } = useParams();
  const [auction, setAuction] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setAuction(null);
    setError('');
    read({
      auctionId
    }, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (data?._id) setAuction(data);else setError(data?.error || 'Could not load auction');
    });
    return () => controller.abort();
  }, [auctionId]);
  if (!auction) {
    return <div className={styles.container}>
        
    {error ? <div className="empty-state">
            
      <Icon name="gavel" size={34} />
            
      <h3>This auction needs a moment</h3>
            
      <p>
        {error}
      </p>
            
      <Link to="/auctions/all">Explore auctions</Link>
          
    </div> : <div className={styles.noBids}>Loading auction details…</div>}
      
  </div>;
  }
  const imageUrl = auction.image || (auction._id ? `/api/auctions/image/${auction._id}` : '/api/auctions/defaultphoto');
  const currentDate = new Date();
  const isPending = currentDate < new Date(auction.bidStart);
  const isLive = currentDate >= new Date(auction.bidStart) && currentDate < new Date(auction.bidEnd);
  const isEnded = currentDate >= new Date(auction.bidEnd);
  return <div className={styles.container}>
      
    <BackLink to="/auctions/all">Back to auctions</BackLink>
      
    {error && <div className={styles.errorAlert}>
      {error}
    </div>}

      
    <div className={styles.card}>
        
      <div className={styles.headerRow}>
          
        <div>
            
          <h1 className={styles.title}>
            {auction.itemName}
          </h1>
            
          <div className={styles.sellerText}>
              Listed by: <strong>
              {auction.seller?.name || 'Seller'}
            </strong>
            
          </div>
          
        </div>
          
        <div>
            
          {isPending && <span className={`${styles.auctionStatus} ${styles.statusPending}`}>Upcoming</span>}
            
          {isLive && <span className={`${styles.auctionStatus} ${styles.statusLive}`}>Live now</span>}
            
          {isEnded && <span className={`${styles.auctionStatus} ${styles.statusEnded}`}>Ended</span>}
          
        </div>
        
      </div>

        
      <div className={styles.auctionGrid}>
          
        <div>
            
          <div className={styles.imageBox}>
              
            <ProductImage product={{
              ...auction,
              name: auction.itemName,
              image: imageUrl
            }} className={styles.image} loading="eager" />
            
          </div>
            
          <h4 className={styles.sectionHeading}>About Item</h4>
            
          {auction.description && <p className={styles.description}>
            {auction.description}
          </p>}
          
        </div>

          
        <div>
            

            

            

            
          </div>
        
      </div>
      
    </div>
    
  </div>;
}
