import useCursorList from '../../components/useCursorList';
import LoadBoundary from '../../components/LoadBoundary';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { listByShop, getStatusValues } from '../../api/api-order';
import { read as readShop } from '../../api/api-shop';
import { ProductImage, formatPrice } from '../../components/ProductCard';
import BackLink from '../../components/BackLink';
import styles from './ShopOrders.module.css';

export default function ShopOrders() {
  const { shopId } = useParams();

  const authData = auth.isAuthenticated();

  const [shop, setShop] = useState({});

  const page = useCursorList(
    (cursor, signal) => listByShop({ shopId, cursor }, { t: authData.token }, signal),
    shopId,
    'orders'
  );

  const orders = page.data;
  const setOrders = page.setData;

  const [statusValues, setStatusValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    Promise.all([readShop({ shopId }, controller.signal), getStatusValues(controller.signal)]).then(
      ([shopData, statuses]) => {
        if (controller.signal.aborted) return;
        if (shopData && !shopData.error) setShop(shopData);
        if (Array.isArray(statuses)) setStatusValues(statuses);
        setLoading(false);
      }
    );

    return () => controller.abort();
  }, [shopId]);

  

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <BackLink to="/seller/shops">Back to my shops</BackLink>
        <h1 className={styles.title}>Orders{shop.name ? ` for ${shop.name}` : ''}</h1>
        <p className={styles.subtitle}>Manage deliveries and keep your customers updated.</p>
      </header>
      {loading || page.loading ? (
        <div className={styles.emptyCard} aria-busy="true">
          Loading orders…
        </div>
      ) : error || page.error ? (
        <div className={styles.emptyCard} role="alert">
          {error || page.error}
          <button onClick={page.retry}>Try again</button>
        </div>
      ) : !orders.length ? (
        <div className={styles.emptyCard}>No orders have been received for this shop yet.</div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map(order => {
            const items = order.products
              .map((item, index) => ({
                ...item,
                itemIndex: index,
                rowKey: `${order._id}-${index}`,
              }))
              .filter(item => (item.shop?._id || item.shop) === shopId);
            const total = items.reduce(
              (sum, item) => sum + item.quantity * (item.price ?? item.product?.price ?? 0),
              0
            );
            const address = order.delivery_address || {};
            const locality = [address.city, address.state, address.zipcode]
              .filter(Boolean)
              .join(', ');

            return (
              <article key={order._id} className={styles.orderCard}>
                <header className={styles.orderCardHeader}>
                  <div>
                    <h2 className={styles.orderId} title={`Order #${order._id}`}>
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h2>
                    <p className={styles.orderDate}>
                      Placed{' '}
                      <time dateTime={new Date(order.created).toISOString()}>
                        {new Date(order.created).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                    </p>
                  </div>
                  <div className={styles.orderTotal}>
                    <span>Shop total</span>
                    <strong>{formatPrice(total)}</strong>
                  </div>
                </header>
                <div className={styles.orderInfo}>
                  <section className={styles.infoBlock}>
                    <h3>Customer</h3>
                    <p className={styles.customerName}>{order.customer_name}</p>
                    <p className={styles.customerEmail}>{order.customer_email}</p>
                  </section>
                  <section className={styles.infoBlock}>
                    <h3>Delivery address</h3>
                    <address>
                      {address.street && <span>{address.street}</span>}
                      {locality && <span>{locality}</span>}
                      {address.country && <span>{address.country}</span>}
                    </address>
                  </section>
                </div>
                <div className={styles.productsList}>
                  {items.map(item => (
                    <div key={item.rowKey} className={styles.productRow}>
                      {item.product ? (
                        <Link
                          to={`/product/${item.product._id}`}
                          className={styles.productImageLink}
                        >
                          <ProductImage product={item.product} className={styles.productImage} />
                        </Link>
                      ) : (
                        <div className={styles.productImageLink} />
                      )}
                      <div className={styles.productDetails}>
                        <h3 className={styles.productTitle}>
                          {item.product ? (
                            <Link to={`/product/${item.product._id}`}>{item.product.name}</Link>
                          ) : (
                            'Product no longer available'
                          )}
                        </h3>
                        <p className={styles.productQty}>
                          {item.quantity} × {formatPrice(item.price ?? item.product?.price)}
                          <strong>
                            {formatPrice(item.quantity * (item.price ?? item.product?.price ?? 0))}
                          </strong>
                        </p>
                      </div>
                      
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
      <LoadBoundary page={page} />
    </div>
  );
}
