import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadBoundary from '../components/LoadBoundary';
import { list, metadata } from '../api/api-product';
import useCursorList from '../components/useCursorList';
import ProductCard, { ProductSkeletons } from '../components/ProductCard';
import cardStyles from '../components/ProductCard.module.css';
import styles from './Home.module.css';
export default function Home() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const [draft, setDraft] = useState(query);
  const search = event => {
    event.preventDefault();
    setParams(draft.trim() ? {
      q: draft.trim()
    } : {});
  };
  const category = params.get('category') || '';
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    metadata({}, controller.signal).then(data => {
      if (!controller.signal.aborted) setCategories(data.categories);
    }).catch(() => {});
    return () => controller.abort();
  }, []);
  const changeCategory = value => {
    const next = new URLSearchParams(params);
    value ? next.set('category', value) : next.delete('category');
    setParams(next);
  };
  const catalog = useCursorList((cursor, signal) => list({
    cursor,
    search: query,
    category
  }, signal), JSON.stringify([query, category]));
  return <div className="page-container">
    <div className={styles.pageHeading}>
      <h1 className="page-title">Discover products</h1>
    </div>
    <section id="catalog" className={styles.catalog} aria-label="Product catalog">
      <form onSubmit={search} className={styles.catalogSearch}>
        <input aria-label="Search products" value={draft} onChange={event => setDraft(event.target.value)} />
        <button type="submit">Search</button>
      </form>
      <select className={styles.categorySelect} aria-label="Browse categories" value={category} onChange={event => changeCategory(event.target.value)}>
        <option value="">All categories</option>
        {categories.map(item => <option key={item.name} value={item.name}>
          {item.name}
        </option>)}
      </select>
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
