import LoadBoundary from '../components/LoadBoundary';
import { list } from '../api/api-product';
import useCursorList from '../components/useCursorList';
import ProductCard, { ProductSkeletons } from '../components/ProductCard';
import cardStyles from '../components/ProductCard.module.css';
import styles from './Home.module.css';
export default function Home() {
  const catalog = useCursorList((cursor, signal) => list({
    cursor
  }, signal), 'catalog');
  return <div className="page-container">
    <div className={styles.pageHeading}>
      <h1 className="page-title">Discover products</h1>
    </div>
    <section id="catalog" className={styles.catalog} aria-label="Product catalog">
      {catalog.loading ? <ProductSkeletons /> : catalog.error ? <div className="empty-state">
        <p role="alert">
          {catalog.error}
        </p>
        <button onClick={catalog.retry}>Try again</button>
      </div> : !catalog.data.length ? <p>No products listed yet.</p> : <div className={cardStyles.grid}>
        {catalog.data.map(product => <ProductCard product={product} key={product._id} />)}
      </div>}
      <LoadBoundary page={catalog} />
    </section>
  </div>;
}
