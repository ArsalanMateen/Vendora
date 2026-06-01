import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCommerce } from '../state/CommerceProvider';
import useHydratedProducts from '../state/useHydratedProducts';

import CartItems from './CartItems';
import PlaceOrder from './PlaceOrder';
import config from '../config/config';
import Icon from '../components/Icon';

import { formatPrice } from '../components/ProductCard';
import styles from './Cart.module.css';

let stripePromise;

const getStripe = () =>
  stripePromise || (stripePromise = loadStripe(config.stripe_publishable_key));

export default function Cart() {
  const { cart: intent } = useCommerce();
  const hydration = useHydratedProducts(intent.map(item => item.productId));

  const syncing = hydration.loading;
  const found = new Map(hydration.products.map(product => [product._id, product]));
  const cartItems = intent.map(item => {
    const product = found.get(item.productId);

    return {
      quantity: item.quantity,
      product: product || {
        _id: item.productId,
        name: 'Product unavailable',
        price: 0,
        quantity: 0,
      },
      shop: product?.shop,
      unavailable: !product || !!hydration.error,
    };
  });
  const total = cartItems
    .reduce((sum, item) => sum + item.quantity * item.product.price, 0)
    .toFixed(2);
  const invalid = cartItems.some(
    item => item.unavailable || item.product.quantity <= 0 || item.quantity > item.product.quantity
  );

  return (
    <div className={styles.cartContainer}>
      <p className="page-kicker">YOUR GOOD FINDS, ALL TOGETHER</p>
      <div className={styles.cartHeader}>
        <div>
          <h1 className={styles.cartTitle}>Your shopping bag.</h1>
          <p className={styles.cartSubtitle}>A little closer to making them yours.</p>
        </div>
      </div>
      {!cartItems.length && !syncing ? (
        <div className="empty-state">
          <Icon name="bag" size={38} />
          <h3>Room for your next favorite.</h3>
          <p>Your shopping bag is empty. Explore the collection and bring a good find home.</p>
          <Link to="/">Discover something new</Link>
        </div>
      ) : (
        <div className={styles.cartLayout}>
          <div className={styles.leftCol}>
            {syncing && (
              <p className={styles.syncNotice} role="status">
                Checking the latest prices and availability…
              </p>
            )}
            {hydration.error && (
              <p role="alert">
                {hydration.error}
                <button onClick={hydration.retry}>Try again</button>
              </p>
            )}
            <CartItems cartItems={cartItems} disabled={syncing} />
            {!syncing && invalid && (
              <div className={styles.errorAlert} role="alert">
                Some items are unavailable or exceed the current stock. Update your bag to continue.
                <button onClick={() => hydration.retry()}>Check again</button>
              </div>
            )}
          </div>
          <div className={styles.rightCol}>
            <div className={styles.checkoutCard}>
              <h2 className={styles.orderSummaryTitle}>The details</h2>
              <div className={styles.summaryRow}>
                <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              {cartItems.length > 0 && !syncing && !invalid && (
                <Elements stripe={getStripe()}>
                  <PlaceOrder cartItems={cartItems} />
                </Elements>
              )}
              <p className={styles.checkoutTrust}>
                <Icon name="shield" size={15} />
                Payments processed through Stripe
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
