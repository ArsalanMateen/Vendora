import { Link } from 'react-router-dom';
import { list } from '../../api/api-shop';
import useRemoteList from '../../components/useRemoteList';

import Icon from '../../components/Icon';
import styles from './Shop.module.css';

export default function Shops() {
  const { data: shops, loading, error, retry } = useRemoteList(list);

  return (
    <div className={styles.container}>
      <p className="page-kicker">MEET THE PEOPLE BEHIND THE FINDS</p>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Discover shops</h1>
          <p className={styles.subtitle}>Explore shops and discover their collections.</p>
        </div>
      </div>
      {loading ? (
        <div className={styles.shopGrid} aria-busy="true" aria-label="Loading shops">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className={styles.shopSkeleton} />
          ))}
        </div>
      ) : error ? (
        <div className="empty-state">
          <Icon name="shop" size={32} />
          <h3>We couldn’t load the shops</h3>
          <p>{error}</p>
          <button onClick={retry}>Try again</button>
        </div>
      ) : !shops.length ? (
        <div className="empty-state">
          <Icon name="shop" size={32} />
          <h3>The first chapter starts here</h3>
          <p>New storefronts will appear here.</p>
        </div>
      ) : (
        <div className={styles.shopGrid}>
          {shops.map(shop => (
            <Link to={`/shops/${shop._id}`} className={styles.shopCard} key={shop._id}>
              <div className={styles.cardContent}>
                <h2 className={styles.shopName}>{shop.name}</h2>
                {shop.owner?.name && <p className={styles.ownerText}>By {shop.owner.name}</p>}
                {shop.description && <p className={styles.shopDesc}>{shop.description}</p>}
                <span className={styles.shopCardFooter}>Discover the collection</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
