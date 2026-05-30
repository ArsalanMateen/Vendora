import { useCommerce } from '../state/CommerceProvider';
import useHydratedProducts from '../state/useHydratedProducts';
import CartItems from './CartItems';
import styles from './Cart.module.css';
export default function Cart() {
  const {
    cart
  } = useCommerce();
  const data = useHydratedProducts(cart.map(item => item.productId));
  const found = new Map(data.products.map(product => [product._id, product]));
  const items = cart.map(item => ({
    quantity: item.quantity,
    product: found.get(item.productId) || {
      _id: item.productId,
      name: 'Product unavailable',
      price: 0,
      quantity: 0
    },
    shop: found.get(item.productId)?.shop,
    unavailable: !found.has(item.productId)
  }));
  return <div className={styles.cartContainer}>
    <h1>Your shopping bag</h1>
    {data.loading ? <p>Checking prices and availability</p> : data.error ? <p role="alert">
      {data.error}
    </p> : !items.length ? <p>Your bag is empty.</p> : <CartItems cartItems={items} disabled={data.loading} />}
  </div>;
}
