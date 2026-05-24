import { ProductImage } from '../../components/ProductCard';
import IconAction from '../../components/IconAction';

import { Link } from 'react-router-dom';
import { listByShop } from '../../api/api-product';
import useCursorList from '../../components/useCursorList';
import LoadBoundary from '../../components/LoadBoundary';
import DeleteProduct from '../../components/DeleteProduct';
import styles from './Product.module.css';

export default function MyProducts({ shopId }) {
  const page = useCursorList((cursor, signal) => listByShop({ shopId, cursor }, signal), shopId);

  const products = page.data;
  const loading = page.loading;
  const handleDeleted = page.remove;

  return (
    <div className={styles.inventoryCard}>
      <div className={styles.inventoryHeader}>
        <div>
          <h3 className={styles.inventoryTitle}>Shop Inventory ({page.totalCount})</h3>
          <p className={styles.inventorySubtitle}>
            Products currently listed under this storefront
          </p>
        </div>
        <Link to={'/seller/' + shopId + '/products/new'} className={styles.btnAddProduct}>
          + Add Product
        </Link>
      </div>

      {loading ? (
        <div className={styles.loadingSmall}>Loading products...</div>
      ) : page.error ? (
        <div role="alert">
          {page.error}
          <button onClick={page.retry}>Try again</button>
        </div>
      ) : products.length === 0 ? (
        <div className={styles.emptyInventory}>No products listed yet.</div>
      ) : (
        <div className={styles.inventoryList}>
          {products.map(product => (
            <div key={product._id} className={styles.inventoryItem}>
              <div className={styles.inventoryItemLeft}>
                <ProductImage product={product} className={styles.productThumbSmall} />
                <div>
                  <h4 className={styles.inventoryItemName}>{product.name}</h4>
                  <div className={styles.inventoryItemMeta}>
                    <span>${product.price}</span> &bull;
                    <span>{product.quantity} in stock</span> &bull;
                    <span>{product.category}</span>
                  </div>
                </div>
              </div>

              <div className={styles.inventoryItemActions}>
                <IconAction
                  to={'/seller/' + shopId + '/' + product._id + '/edit'}
                  icon="edit"
                  label={'Edit ' + product.name}
                />
                <DeleteProduct shopId={shopId} product={product} onDeleted={handleDeleted} />
              </div>
            </div>
          ))}
        </div>
      )}
      <LoadBoundary page={page} />
    </div>
  );
}
