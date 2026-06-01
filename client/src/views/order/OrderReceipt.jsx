import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { read } from '../../api/api-order';
import styles from './Order.module.css';
import { ProductImage, formatPrice } from '../../components/ProductCard';

export default function OrderReceipt() {
  const { orderId } = useParams();

  const authData = auth.isAuthenticated();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);
    setOrder(null);
    read({ orderId }, { t: authData.token }, abortController.signal).then(data => {
      if (abortController.signal.aborted) return;
      if (data && !data.error) {
        setOrder(data);
      }
      setLoading(false);
    });

    return () => abortController.abort();
  }, [orderId]);

  if (loading) return <div className={styles.loading}>Loading order receipt...</div>;
  if (!order) return <div className={styles.loading}>Order not found.</div>;

  const total = order.products
    .reduce((a, b) => a + b.quantity * (b.price ?? b.product?.price ?? 0), 0)
    .toFixed(2);
  const placed = new Date(order.created);
  const address = order.delivery_address || {};

  return (
    <div className={styles.container}>
      <div className={styles.receiptCard}>
        <p className={styles.kicker}>Order receipt</p>
        <h1 className={styles.title}>Thank you for your order.</h1>

        <dl className={styles.infoSection}>
          <div className={styles.infoBlock}>
            <dt>Placed on</dt>
            <dd>
              <time dateTime={placed.toISOString()}>
                {placed.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
              <span className={styles.orderTime}>
                {placed.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              </span>
            </dd>
          </div>
          <div className={styles.infoBlock}>
            <dt>Customer</dt>
            <dd>{order.customer_name}</dd>
          </div>
          <div className={styles.shippingBlock}>
            <dt>Shipping address</dt>
            <dd>
              <address>
                {address.street}
                <br />
                {[
                  address.city,
                  [address.state, address.zipcode].filter(Boolean).join(' '),
                  address.country,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </address>
            </dd>
          </div>
        </dl>

        <h2 className={styles.itemsHeading}>Your items</h2>
        <div className={styles.itemsTable}>
          {order.products.map((item, idx) => (
            <div key={idx} className={styles.receiptRow}>
              {item.product && <ProductImage product={item.product} className={styles.itemImage} />}
              <div className={styles.itemInfo}>
                <strong>
                  {item.product ? (
                    <Link to={`/product/${item.product._id}`}>{item.product.name}</Link>
                  ) : (
                    'Product no longer available'
                  )}
                </strong>
                {item.shop?.name && <div className={styles.receiptShop}>{item.shop.name}</div>}
                {item.status && <span className={styles.receiptStatus}>{item.status}</span>}
              </div>
              <div className={styles.receiptRight}>
                <span>
                  {item.quantity} &times; {formatPrice(item.price ?? item.product?.price)}
                </span>
                <span className={styles.receiptSub}>
                  {formatPrice(item.quantity * (item.price ?? item.product?.price ?? 0))}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.totalRow}>
          <span>Total paid</span>
          <span>${total}</span>
        </div>

        <div className={styles.actions}>
          <Link to="/" className={styles.btnContinue}>
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
