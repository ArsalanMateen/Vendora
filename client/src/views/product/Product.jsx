
import BackLink from '../../components/BackLink';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { read } from '../../api/api-product';


import { ProductImage, formatPrice } from '../../components/ProductCard';

import Icon from '../../components/Icon';
import styles from './Product.module.css';

export default function Product() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  

  


  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError('');
    setNotFound(false);
    setProduct(null);

    read({ productId }, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (data?._id) setProduct(data);
      else setError(data?.error || 'We couldn’t load this product. Please try again.');
      setNotFound(Boolean(data?.notFound));
      setLoading(false);
    });


    return () => controller.abort();
  }, [productId, revision]);

  

  return (
    <div className={styles.container}>
      <BackLink to="/">Back to Discover</BackLink>
      {loading ? (
        <div
          className={styles.detailSkeleton}
          aria-label="Loading product details"
          aria-busy="true"
        >
          <div />
          <div>
            <span />
            <span />
            <span />
          </div>
        </div>
      ) : !product ? (
        <div className="empty-state">
          <Icon name="box" size={34} />
          <h3>{notFound ? 'This product is no longer listed' : 'This find needs a moment'}</h3>
          {!notFound && (
            <>
              <p>{error}</p>
              <button onClick={() => setRevision(value => value + 1)}>Try again</button>
            </>
          )}
          <Link to="/">Explore the collection</Link>
        </div>
      ) : (
        <>
          <div className={styles.detailCard}>
            <div className={styles.detailGrid}>
              <div className={styles.productImageWrap}>
                <ProductImage product={product} className={styles.detailImg} loading="eager" />
              </div>
              <div className={styles.productInfo}>
                <h1 className={styles.detailTitle}>{product.name}</h1>
                {product.shop?._id && (
                  <Link to={`/shops/${product.shop._id}`} className={styles.shopAttribution}>
                    <span className={styles.shopAvatar}>
                      <Icon name="shop" size={19} />
                    </span>
                    <span>
                      <small>SHOP</small>
                      <strong>{product.shop.name}</strong>
                    </span>
                  </Link>
                )}
                <div className={styles.purchaseSummary}>
                  <div className={styles.priceTag}>{formatPrice(product.price)}</div>
                  <span className={product.quantity > 0 ? styles.inStock : styles.outOfStock}>
                    {product.quantity > 0 ? `${product.quantity} in stock` : 'Sold out'}
                  </span>
                </div>
                {product.description && (
                  <section className={styles.descriptionBlock} aria-label="Product description">
                    <h2>The details</h2>
                    <p className={styles.detailDesc}>{product.description}</p>
                  </section>
                )}
                
              </div>
            </div>
          </div>
          
        </>
      )}
    </div>
  );
}
