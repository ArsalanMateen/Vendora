import useCursorList from '../../components/useCursorList';
import LoadBoundary from '../../components/LoadBoundary';
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { read } from '../../api/api-user';
import { listByUser } from '../../api/api-order';
import { listByBidder } from '../../api/api-auction';
import Auctions from '../auction/Auctions';
import IconAction from '../../components/IconAction';
import { ProductImage, formatPrice } from '../../components/ProductCard';
import styles from './User.module.css';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const account = auth.isAuthenticated();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSelf = account?.user?._id === userId;

  const orderPage = useCursorList(
    (cursor, signal) => listByUser({ userId, cursor }, { t: account.token }, signal),
    userId,
    'orders',
    isSelf
  );
  const bidPage = useCursorList(
    (cursor, signal) => listByBidder({ userId, cursor }, { t: account.token }, signal),
    userId,
    'auctions',
    isSelf
  );

  const orders = orderPage.data;
  const bidAuctions = bidPage.data;

  const removeBidAuction = useCallback(auction => bidPage.remove(auction._id), [bidPage.remove]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    read({ userId }, { t: account.token }, controller.signal).then(profile => {
      if (controller.signal.aborted) return;
      if (profile?.error) {
        navigate('/signin');
        return;
      }
      if (!profile?._id) {
        setError('We couldn’t load your profile. Please try again.');
        setLoading(false);
        return;
      }
      setUser(profile);
      setLoading(false);
    });

    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    if (!loading && location.hash === '#orders')
      document.getElementById('orders')?.scrollIntoView({ block: 'start' });
  }, [loading, location.hash]);

  if (loading) return <div className={styles.loading}>Loading profile…</div>;
  if (error || !user)
    return (
      <div className={styles.loading} role="alert">
        {error}
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <header className={styles.profileHeader}>
          <div className={styles.profileIdentity}>
            <h1 className={styles.name}>{user.name}</h1>
            <p className={styles.email}>{user.email}</p>
          </div>
          <div className={styles.profileTools}>
            <span className={styles.accountBadge}>
              {user.seller ? 'Seller account' : 'Buyer account'}
            </span>
            {isSelf && (
              <IconAction to={`/user/edit/${user._id}`} icon="edit" label="Edit profile" />
            )}
          </div>
        </header>
        {isSelf && (
          <section id="orders" className={styles.ordersSection} style={{ scrollMarginTop: 90 }}>
            <h2 className={styles.ordersTitle}>My orders</h2>
            {orderPage.loading ? (
              <p>Loading orders</p>
            ) : orderPage.error ? (
              <p role="alert">
                {orderPage.error}
                <button onClick={orderPage.retry}>Try again</button>
              </p>
            ) : !orders.length ? (
              <p className={styles.emptyOrders}>You haven't placed any orders yet.</p>
            ) : (
              <div className={styles.ordersList}>
                {orders.map(order => (
                  <article key={order._id} className={styles.orderItem}>
                    <header className={styles.orderHeader}>
                      <div>
                        <h3 className={styles.orderNumber} title={`Order #${order._id}`}>
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <p>
                          Placed{' '}
                          {new Date(order.created).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <strong className={styles.orderTotal}>
                        {formatPrice(
                          order.products.reduce(
                            (sum, item) =>
                              sum + item.quantity * (item.price ?? item.product?.price ?? 0),
                            0
                          )
                        )}
                      </strong>
                    </header>
                    {order.products.map((item, index) => (
                      <div
                        key={item._id || `${order._id}-${index}`}
                        className={styles.orderProductRow}
                      >
                        {item.product ? (
                          <Link
                            to={`/product/${item.product._id}`}
                            className={styles.orderImageLink}
                          >
                            <ProductImage product={item.product} className={styles.orderImage} />
                          </Link>
                        ) : (
                          <div className={styles.orderImageLink} />
                        )}
                        <div className={styles.orderProductInfo}>
                          <p>{item.product?.name || 'Product no longer available'}</p>
                          <span>
                            {item.quantity} × {formatPrice(item.price ?? item.product?.price)}
                          </span>
                          {item.shop?.name && <span>{item.shop.name}</span>}
                        </div>
                        <span className={styles.orderStatus}>{item.status}</span>
                      </div>
                    ))}
                    <footer className={styles.orderFooter}>
                      <Link to={`/order/${order._id}`} className={styles.receiptLink}>
                        View receipt
                      </Link>
                    </footer>
                  </article>
                ))}
              </div>
            )}
            <LoadBoundary page={orderPage} />
          </section>
        )}
        {isSelf && (
          <section className={styles.ordersSection}>
            <h2 className={styles.ordersTitle}>My bids</h2>
            {bidPage.loading ? (
              <p>Loading auctions</p>
            ) : bidPage.error ? (
              <p role="alert">
                {bidPage.error}
                <button onClick={bidPage.retry}>Try again</button>
              </p>
            ) : !bidAuctions.length ? (
              <p className={styles.emptyOrders}>You haven't participated in any auctions yet.</p>
            ) : (
              <Auctions auctions={bidAuctions} removeAuction={removeBidAuction} />
            )}
            <LoadBoundary page={bidPage} />
          </section>
        )}
      </div>
    </div>
  );
}
