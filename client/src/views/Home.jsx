import Icon from '../components/Icon';
import { useState, useEffect, useMemo } from 'react';
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
  const [sort, setSort] = useState('newest');
  const catalog = useCursorList((cursor, signal) => list({
    cursor,
    search: query,
    category,
    sort
  }, signal), JSON.stringify([query, category, sort]));
  const categoryShortcuts = useMemo(() => {
    const remaining = [...categories];
    const representedShops = new Set();
    const shortcuts = [];
    const newShopCount = entry => [...entry.shopIds].filter(id => !representedShops.has(id)).length;

    // Spread shortcuts across the catalog's shops rather than repeating its busiest product family.
    while (remaining.length && shortcuts.length < 4) {
      remaining.sort((a, b) => newShopCount(b) - newShopCount(a) || b.count - a.count || a.name.localeCompare(b.name));
      const entry = remaining.shift();
      shortcuts.push(entry);
      entry.shopIds.forEach(id => representedShops.add(id));
    }
    const selected = categories.find(entry => entry.name === category);
    if (selected && !shortcuts.includes(selected)) shortcuts.splice(3, 1, selected);
    return shortcuts;
  }, [categories, category]);
  return <div className="page-container">
    <div className={styles.pageHeading}>
      <h1 className="page-title">Discover products</h1>
    </div>
    <section id="catalog" className={styles.catalog} aria-label="Product catalog">
      <form onSubmit={search} className={styles.catalogSearch}>
        <input aria-label="Search products" value={draft} onChange={event => setDraft(event.target.value)} />
        <button type="submit">Search</button>
      </form>
      <div className={styles.categoryBar}>
          
        <div className={styles.categoryChips}>
            
          <button className={`${styles.categoryChip} ${!category ? styles.selectedChip : ''}`} onClick={() => changeCategory('')} aria-pressed={!category}>
              
            <Icon name="grid" size={14} />
              All finds
            </button>
            
          {categoryShortcuts.map(item => <button className={`${styles.categoryChip} ${category === item.name ? styles.selectedChip : ''}`} onClick={() => changeCategory(item.name)} key={item.name} aria-pressed={category === item.name}>
                
            {item.name}
              
          </button>)}
          
        </div>
          
        <select aria-label="Browse all categories" value={category} onChange={event => changeCategory(event.target.value)} className={styles.categorySelect}>
            
          <option value="">All categories</option>
            
          {[...categories].sort((a, b) => a.name.localeCompare(b.name)).map(item => <option key={item.name} value={item.name}>
                  
            {item.name}
                
          </option>)}
          
        </select>
        
      </div>
      <label className={styles.sortLabel}>Sort products<select aria-label="Sort products" value={sort} onChange={event => setSort(event.target.value)}>
          <option value="newest">Newest arrivals</option>
          <option value="price-low">Lowest price</option>
          <option value="price-high">Highest price</option>
          <option value="name">Alphabetical</option>
        </select>
      </label>
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
