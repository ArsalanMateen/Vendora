import React from 'react';
import { Link } from 'react-router-dom';

import Icon from './Icon';
import styles from './ProductCard.module.css';

const priceFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
export const formatPrice = value => priceFormatter.format(Number(value) || 0);

export function ProductImage({product,className,loading='lazy'}) {return <img src={product.image || '/api/product/image/'+product._id} alt={product.name || 'Product'} className={className} loading={loading} />;}

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
  
  

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Link to={`/product/${product._id}`} aria-label={`View ${product.name}`}>
          <ProductImage product={product} className={styles.image} />
        </Link>
        
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
