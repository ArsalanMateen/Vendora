import { Link } from 'react-router-dom';
import cart from './cart-helper';
import { ProductImage, formatPrice } from '../components/ProductCard';
import Icon from '../components/Icon';
import styles from './Cart.module.css';

export default function CartItems({ cartItems, disabled }) {
  const updateQuantity = (index, nextQuantity) => {
    const item = cartItems[index];
    const maximum = item.product.quantity;
    if (disabled || item.unavailable || maximum <= 0) return;
    const value = Math.min(maximum, Math.max(1, Number.parseInt(nextQuantity, 10) || 1));
    cart.updateCart(item.product._id, value);
  };

  const remove = index => cart.removeItem(cartItems[index].product._id);

  return (
    <section className={styles.cartItemsCard}>
      <div className={styles.itemsHeading}>
        <h2 className={styles.sectionHeading}>Your collection</h2>
        <span>
          {cartItems.length} {cartItems.length === 1 ? 'find' : 'finds'}
        </span>
      </div>
      <div className={styles.itemsList}>
        {cartItems.map((item, index) => (
          <div key={item.product._id} className={styles.itemRow}>
            <Link to={`/product/${item.product._id}`} className={styles.itemImageLink}>
              {item.unavailable && !item.product.image ? (
                <div className={styles.itemThumb} />
              ) : (
                <ProductImage product={item.product} className={styles.itemThumb} />
              )}
            </Link>
            <div className={styles.itemInfo}>
              <Link to={`/product/${item.product._id}`} className={styles.itemName}>
                {item.product.name}
              </Link>
              {item.shop?._id && (
                <Link to={`/shops/${item.shop._id}`} className={styles.itemShop}>
                  {item.shop.name}
                </Link>
              )}
              <span className={styles.itemPrice}>{formatPrice(item.product.price)} each</span>
              {(item.unavailable || item.product.quantity <= 0) && (
                <span className={styles.unavailable}>Currently unavailable</span>
              )}
              {item.quantity > item.product.quantity && item.product.quantity > 0 && (
                <span className={styles.unavailable}>Only {item.product.quantity} available</span>
              )}
            </div>
            <div className={styles.quantityControls}>
              <div
                className={styles.qtyStepper}
                role="group"
                aria-label={`Quantity controls for ${item.product.name}`}
              >
                <button
                  type="button"
                  className={styles.qtyButton}
                  aria-label={`Decrease quantity for ${item.product.name}`}
                  disabled={
                    disabled || item.unavailable || item.product.quantity <= 0 || item.quantity <= 1
                  }
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                >
                  −
                </button>
                <input
                  id={`quantity-${item.product._id}`}
                  aria-label={`Quantity for ${item.product.name}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max={Math.max(1, item.product.quantity)}
                  value={item.quantity}
                  disabled={disabled || item.unavailable || item.product.quantity <= 0}
                  onChange={event => updateQuantity(index, event.target.value)}
                  className={styles.qtyInput}
                />
                <button
                  type="button"
                  className={styles.qtyButton}
                  aria-label={`Increase quantity for ${item.product.name}`}
                  disabled={
                    disabled ||
                    item.unavailable ||
                    item.product.quantity <= 0 ||
                    item.quantity >= item.product.quantity
                  }
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <span className={styles.itemTotal}>
              {formatPrice(item.product.price * item.quantity)}
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => remove(index)}
              className={styles.btnRemove}
              aria-label={`Remove ${item.product.name}`}
              title="Remove from bag"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
