import { useMemo, useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { list, metadata } from '../api/api-product';
import auth from '../auth/auth-helper';
import useCursorList from '../components/useCursorList';
import LoadBoundary from '../components/LoadBoundary';
import ProductCard, { ProductSkeletons } from '../components/ProductCard';
import Icon from '../components/Icon';
import cardStyles from '../components/ProductCard.module.css';
import styles from './Home.module.css';

const countLabel = (count, singular, plural = `${singular}s`) =>
  `${count.toLocaleString()} ${count === 1 ? singular : plural}`;

export default function Home() {
  const [params, setParams] = useSearchParams();

  const query = params.get('q') || '';

  const [searchDraft, setSearchDraft] = useState(query);

  const category = params.get('category') || '';

  const [sort, setSort] = useState('newest');
  const [stockOnly, setStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const filterKey = JSON.stringify([query, category, sort, stockOnly, minPrice, maxPrice]);

  const catalog = useCursorList(
    (cursor, signal) =>
      list(
        { search: query, category, sort, stockOnly: String(stockOnly), minPrice, maxPrice, cursor },
        signal
      ),
    filterKey
  );

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    metadata({}, controller.signal)
      .then(data => {
        if (!controller.signal.aborted) setCategories(data.categories);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  const previousFilterKey = useRef(filterKey);

  const account = auth.isAuthenticated();
  const sellerPath = account?.user?.seller
    ? '/seller/shops'
    : account
      ? `/user/edit/${account.user._id}`
      : '/signup';

  const categoryShortcuts = useMemo(() => {
    const remaining = [...categories];
    const representedShops = new Set();
    const shortcuts = [];

    const newShopCount = entry => [...entry.shopIds].filter(id => !representedShops.has(id)).length;

    // Spread shortcuts across the catalog's shops rather than repeating its busiest product family.
    while (remaining.length && shortcuts.length < 4) {
      remaining.sort(
        (a, b) =>
          newShopCount(b) - newShopCount(a) || b.count - a.count || a.name.localeCompare(b.name)
      );
      const entry = remaining.shift();
      shortcuts.push(entry);
      entry.shopIds.forEach(id => representedShops.add(id));
    }
    const selected = categories.find(entry => entry.name === category);
    if (selected && !shortcuts.includes(selected)) shortcuts.splice(3, 1, selected);

    return shortcuts;
  }, [categories, category]);

  const priceError = minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice);

  useLayoutEffect(() => {
    if (previousFilterKey.current !== filterKey) {
      document.getElementById('catalog')?.scrollIntoView({ block: 'start' });
    }
    previousFilterKey.current = filterKey;
  }, [filterKey]);

  useEffect(() => setSearchDraft(query), [query]);

  const visible = catalog.data;
  const hasMore = catalog.hasMore;

  const changeCategory = value => {
    const next = new URLSearchParams(params);
    value ? next.set('category', value) : next.delete('category');
    setParams(next);
  };

  const searchProducts = event => {
    event.preventDefault();
    const next = new URLSearchParams(params);
    const value = searchDraft.trim();
    value ? next.set('q', value) : next.delete('q');
    setParams(next);
  };

  const reset = () => {
    setParams({});
    setStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
  };

  const resetProductFilters = () => {
    setStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
  };

  const activeFilters = Number(stockOnly) + Number(minPrice !== '') + Number(maxPrice !== '');

  return (
    <div className="page-container">
      <div className={styles.pageHeading}>
        <div>
          <p className="page-kicker">MARKETPLACE</p>
          <h1 className="page-title">Discover products</h1>
          <p className="page-description">Browse products from shops.</p>
        </div>
      </div>

      <section id="catalog" className={styles.catalog} aria-label="Product catalog">
        <form className={styles.catalogSearch} role="search" onSubmit={searchProducts}>
          <input
            aria-label="Search products"
            placeholder="Search products"
            value={searchDraft}
            onChange={event => setSearchDraft(event.target.value)}
          />
          <button type="submit" aria-label="Search products" title="Search products">
            <Icon name="search" size={20} />
          </button>
        </form>
        {(query || category) && (
          <div className={styles.sectionHeader}>
            <h2>{query ? `Results for “${query}”` : category}</h2>
          </div>
        )}
        <div className={styles.categoryBar}>
          <div className={styles.categoryChips}>
            <button
              className={`${styles.categoryChip} ${!category ? styles.selectedChip : ''}`}
              onClick={() => changeCategory('')}
              aria-pressed={!category}
            >
              <Icon name="grid" size={14} />
              All finds
            </button>
            {categoryShortcuts.map(item => (
              <button
                className={`${styles.categoryChip} ${category === item.name ? styles.selectedChip : ''}`}
                onClick={() => changeCategory(item.name)}
                key={item.name}
                aria-pressed={category === item.name}
              >
                {item.name}
              </button>
            ))}
          </div>
          <select
            aria-label="Browse all categories"
            value={category}
            onChange={event => changeCategory(event.target.value)}
            className={styles.categorySelect}
          >
            <option value="">All categories</option>
            {[...categories]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(item => (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>
        <div className={styles.catalogToolbar}>
          <span className={styles.resultCount} role="status">
            {catalog.loading
              ? 'Finding the good stuff'
              : catalog.error
                ? 'Catalog unavailable'
                : `${countLabel(catalog.totalCount, 'product')} ${category || query ? 'found' : 'to discover'}`}
            {(query || category) && (
              <button onClick={reset} className={styles.clearFilters}>
                Clear
                <Icon name="close" size={12} />
              </button>
            )}
          </span>
          <div className={styles.toolbarControls}>
            <button
              className={`${styles.filterButton} ${activeFilters ? styles.filtersActive : ''}`}
              aria-expanded={filtersOpen}
              aria-controls="product-filters"
              onClick={() => setFiltersOpen(value => !value)}
            >
              <Icon name="filter" size={14} />
              Filters{activeFilters > 0 && <span>{activeFilters}</span>}
            </button>
            <label className={styles.sortLabel}>
              Sort by:
              <select
                aria-label="Sort products"
                value={sort}
                onChange={event => setSort(event.target.value)}
              >
                <option value="newest">Newest arrivals</option>
                <option value="price-low">Lowest price</option>
                <option value="price-high">Highest price</option>
                <option value="name">Alphabetical</option>
              </select>
            </label>
          </div>
        </div>
        {filtersOpen && (
          <section id="product-filters" className={styles.filterPanel} aria-label="Product filters">
            <div className={styles.filterHeader}>
              <div>
                <h2>Filter products</h2>
                {activeFilters > 0 && <span>{activeFilters} active</span>}
              </div>
              <div className={styles.filterHeaderActions}>
                <button type="button" onClick={resetProductFilters} disabled={!activeFilters}>
                  Reset
                </button>
                <button
                  type="button"
                  className={styles.closeFilters}
                  aria-label="Close filters"
                  onClick={() => setFiltersOpen(false)}
                >
                  <Icon name="close" size={17} />
                </button>
              </div>
            </div>
            <div className={styles.filterFields}>
              <div className={styles.availabilityField}>
                <span className={styles.filterFieldLabel}>Availability</span>
                <label className={styles.stockFilter}>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={stockOnly}
                    onChange={event => setStockOnly(event.target.checked)}
                  />
                  <span>In stock only</span>
                </label>
              </div>
              <fieldset className={styles.priceFilter}>
                <legend>Price range</legend>
                <div className={styles.priceInputs}>
                  <label>
                    <span className={styles.priceCurrency}>$</span>
                    <input
                      aria-label="Minimum price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Minimum"
                      value={minPrice}
                      onChange={event => setMinPrice(event.target.value)}
                    />
                  </label>
                  <span className={styles.priceSeparator}>to</span>
                  <label>
                    <span className={styles.priceCurrency}>$</span>
                    <input
                      aria-label="Maximum price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Maximum"
                      value={maxPrice}
                      onChange={event => setMaxPrice(event.target.value)}
                    />
                  </label>
                </div>
              </fieldset>
            </div>
            {priceError && (
              <p className={styles.priceError} role="alert">
                Maximum price must be greater than or equal to minimum price.
              </p>
            )}
          </section>
        )}
        {catalog.loading ? (
          <ProductSkeletons />
        ) : catalog.error ? (
          <div className="empty-state">
            <Icon name="box" size={34} />
            <h3>The good finds need a moment</h3>
            <p>{catalog.error}</p>
            <button onClick={catalog.retry}>Try again</button>
          </div>
        ) : !visible.length ? (
          <div className="empty-state">
            <Icon name="search" size={34} />
            <h3>{categories.length ? 'No finds this time' : 'The next chapter is yours'}</h3>
            <p>
              {categories.length
                ? 'Try a different search, category, or price range. Your next favorite might be one click away.'
                : 'The first storefront is a great place to start. Create a shop and share your products with the community.'}
            </p>
            {categories.length ? (
              <button onClick={reset}>Explore all finds</button>
            ) : (
              <Link to={sellerPath}>Start selling</Link>
            )}
          </div>
        ) : (
          <>
            <div className={cardStyles.grid}>
              {visible.map(product => (
                <ProductCard product={product} key={product._id} />
              ))}
            </div>
            <LoadBoundary page={catalog}>
              <p role="status">
                Showing {visible.length.toLocaleString()} of {catalog.totalCount.toLocaleString()}{' '}
                products
              </p>
              <span>
                {hasMore
                  ? 'More products appear as you scroll'
                  : 'All matching products are displayed'}
              </span>
            </LoadBoundary>
          </>
        )}
      </section>
    </div>
  );
}
