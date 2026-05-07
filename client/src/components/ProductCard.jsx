import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSaved, useCommerceStore } from '../state/CommerceProvider';
import Icon from './Icon';
import styles from './ProductCard.module.css';

const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const formatPrice = value => priceFormatter.format(Number(value) || 0);

export function ProductImage({ product, className, loading = 'lazy' }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [product._id, product.image]);

  if (failed)
    return (
      <div
        className={`${styles.imageFallback} ${className || ''}`}
        role="img"
        aria-label={`${product.name || 'Product'} — image unavailable`}
      >
        <Icon name="box" size={40} />
        <span>Image unavailable</span>
      </div>
    );

  return (
    <img
      src={
        typeof product.image === 'string' && product.image
          ? product.image
          : `/api/product/image/${product._id}`
      }
      alt={product.name || 'Product'}
      className={className}
      style={{ filter: 'url(#vendora-image-background)' }}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export function ProductSkeletons({ count = 8 }) {
  return (
    <div className={styles.grid} aria-label="Loading products" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div className={styles.skeleton} key={index}>
          <div />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

function ProductCard({ product, showShop = true }) {
  const saved = useSaved(product._id);
  const store = useCommerceStore();

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Link to={`/product/${product._id}`} aria-label={`View ${product.name}`}>
          <ProductImage product={product} className={styles.image} />
        </Link>
        <button
          className={`${styles.saveButton} ${saved ? styles.saved : ''}`}
          onClick={() => store.actions.toggleSaved(product._id)}
          aria-label={`${saved ? 'Unsave' : 'Save'} ${product.name}`}
          aria-pressed={saved}
          title={saved ? 'Remove from saved items' : 'Save for later'}
        >
          <Icon name="heart" size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
        {product.quantity <= 0 && <span className={styles.soldOut}>Sold out</span>}
      </div>
      <div className={styles.info}>
        <Link to={`/product/${product._id}`} className={styles.productName} title={product.name}>
          {product.name}
        </Link>
        {showShop && product.shop?._id && (
          <Link to={`/shops/${product.shop._id}`} className={styles.shop}>
            <Icon name="shop" size={12} />
            {product.shop.name}
          </Link>
        )}
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
        </div>
      </div>
    </article>
  );
}

export default React.memo(ProductCard);
