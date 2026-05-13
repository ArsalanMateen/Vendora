import { Link } from 'react-router-dom';
import { useCommerce } from '../state/CommerceProvider';
import useHydratedProducts from '../state/useHydratedProducts';

import ProductCard, { ProductSkeletons } from '../components/ProductCard';

import Icon from '../components/Icon';
import cards from '../components/ProductCard.module.css';

export default function Saved() {
  const { savedIds } = useCommerce();

  const saved = savedIds;

  const { products: available, loading, error, retry } = useHydratedProducts(savedIds);

  return (
    <div className="page-container">
      <p className="page-kicker">YOUR COLLECTION</p>
      <h1 className="page-title">Good finds, kept close.</h1>
      <p className="page-description">Your saved items, with the latest prices and availability.</p>
      <div style={{ marginTop: 30 }}>
        {loading ? (
          <ProductSkeletons />
        ) : error ? (
          <div className="empty-state">
            <Icon name="box" size={32} />
            <h3>We couldn’t load your collection</h3>
            <p>{error}</p>
            <button onClick={retry}>Try again</button>
          </div>
        ) : available.length ? (
          <>
            <p className="page-description" style={{ marginBottom: 18 }}>
              {available.length} saved {available.length === 1 ? 'item' : 'items'} available
              {saved.length > available.length
                ? ` · ${saved.length - available.length} no longer listed`
                : ''}
            </p>
            <div className={cards.grid}>
              {available.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Icon name="heart" size={34} />
            <h3>
              {saved.length ? 'These finds are no longer listed' : 'Something catch your eye?'}
            </h3>
            <p>
              Tap the heart on a product to keep your favorites here and come back when you’re
              ready.
            </p>
            <Link to="/">Find your next favorite</Link>
          </div>
        )}
      </div>
    </div>
  );
}
