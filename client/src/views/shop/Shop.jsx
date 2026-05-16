import BackLink from '../../components/BackLink';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { read } from '../../api/api-shop';
import { listByShop, metadata } from '../../api/api-product';

import useCursorList from '../../components/useCursorList';
import LoadBoundary from '../../components/LoadBoundary';
import ProductCard, { ProductSkeletons } from '../../components/ProductCard';
import Icon from '../../components/Icon';
import cards from '../../components/ProductCard.module.css';
import styles from './Shop.module.css';

export default function Shop() {
  const { shopId } = useParams();

  const [shop, setShop] = useState(null);
  const [categories, setCategories] = useState([]);
  const [shopCount, setShopCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [revision, setRevision] = useState(0);

  const catalog = useCursorList(
    (cursor, signal) => listByShop({ shopId, category, cursor }, signal),
    JSON.stringify([shopId, category, revision])
  );

  const products = catalog.data;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setShop(null);
    setCategory('');
    Promise.all([read({ shopId }, controller.signal), metadata({ shopId }, controller.signal)])
      .then(([shopData, productData]) => {
        if (controller.signal.aborted) return;
        if (!shopData?._id || !Array.isArray(productData?.categories))
          throw new Error(
            shopData?.error ||
              productData?.error ||
              'We couldn’t open this storefront. Please try again.'
          );
        setShop(shopData);
        setCategories(productData.categories.map(item => item.name));
        setShopCount(productData.totalCount);
      })
      .catch(err => {
        if (!controller.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [shopId, revision]);

  const filtered = products;

  return (
    <div className={styles.container}>
      <BackLink to="/shops/all">Back to shops</BackLink>
      {loading ? (
        <ProductSkeletons />
      ) : error ? (
        <div className="empty-state">
          <Icon name="shop" size={32} />
          <h3>This storefront needs a moment</h3>
          <p>{error}</p>
          <button onClick={() => setRevision(value => value + 1)}>Try again</button>
        </div>
      ) : (
        <>
          <section className={`${styles.storefrontHeader} ${styles.storefrontWithoutLogo}`}>
            <div className={styles.storefrontInfo}>
              <p className="page-kicker">STOREFRONT</p>
              <h1 className={styles.title}>{shop.name}</h1>
              {shop.owner?.name && <p className={styles.subtitle}>A shop by {shop.owner.name}</p>}
              <p className={styles.storefrontBio}>{shop.description}</p>
            </div>
            <span className={styles.storefrontCount}>
              <strong>{shopCount.toLocaleString()}</strong>products to explore
            </span>
          </section>
          <div className={styles.catalogHeadingRow}>
            <h2 className={styles.sectionHeading}>
              The collection<span>{catalog.totalCount.toLocaleString()} finds</span>
            </h2>
            <div className={styles.storefrontControls}>
              <select
                className={styles.select}
                aria-label="Filter shop category"
                value={category}
                onChange={event => setCategory(event.target.value)}
              >
                <option value="">All categories</option>
                {categories.map(value => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>
          {catalog.loading ? (
            <ProductSkeletons />
          ) : catalog.error ? (
            <div className="empty-state">
              <p role="alert">{catalog.error}</p>
              <button onClick={catalog.retry}>Try again</button>
            </div>
          ) : !filtered.length ? (
            <div className="empty-state">
              <Icon name="box" size={32} />
              <h3>{shopCount ? 'No matching finds' : 'No products listed yet.'}</h3>
              <p>{shopCount ? 'Try a different category.' : ''}</p>
              {shopCount > 0 && (
                <button onClick={() => setCategory('')}>Show the collection</button>
              )}
            </div>
          ) : (
            <>
              <div className={cards.grid}>
                {filtered.map(product => (
                  <ProductCard product={product} key={product._id} showShop={false} />
                ))}
              </div>
              <LoadBoundary page={catalog}>
                {catalog.hasMore && <span role="status">Scroll for more products</span>}
              </LoadBoundary>
            </>
          )}
        </>
      )}
    </div>
  );
}
