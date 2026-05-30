import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import auth from '../auth/auth-helper';
import cart from './cart-helper';
import { create } from '../api/api-order';
import config from '../config/config';
import Icon from '../components/Icon';
import styles from './Cart.module.css';



export default function PlaceOrder({ cartItems }) {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const account = auth.isAuthenticated();

  const [values, setValues] = useState({
    customer_name: account?.user?.name || '',
    customer_email: account?.user?.email || '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    error: '',
    loading: false,
  });

  const change = name => event =>
    setValues(previous => ({ ...previous, [name]: event.target.value, error: '' }));

  const handleSubmit = async event => {
    event.preventDefault();
    if (!account) {
      navigate('/signin', { state: { from: { pathname: '/cart' } } });
      return;
    }
    if (!stripe || !elements || !cartItems.length) return;
    setValues(previous => ({ ...previous, loading: true, error: '' }));
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('The payment form is still loading. Please try again.');
      const payload = await stripe.createToken(cardElement, { name: values.customer_name });
      if (payload.error || !payload.token)
        throw new Error(payload.error?.message || 'Please check your card details.');
      const order = {
        products: cartItems.map(item => ({ productId: item.product._id, quantity: item.quantity })),
        customer_name: values.customer_name,
        customer_email: values.customer_email,
        delivery_address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zipcode: values.zipcode,
          country: values.country,
        },
      };
      const data = await create(
        { userId: account.user._id },
        { t: account.token },
        order,
        payload.token.id
      );
      if (data?.error || !data?._id)
        throw new Error(data?.error || 'We couldn’t place your order. Please try again.');
      cart.emptyCart(() => navigate(`/order/${data._id}`));
    } catch (error) {
      setValues(previous => ({ ...previous, loading: false, error: error.message }));
    }
  };

  if (!account)
    return (
      <div className={styles.signinPrompt}>
        <Icon name="user" size={23} />
        <h3>Make these finds yours.</h3>
        <p>Sign in to complete your order and keep track of your purchases.</p>
        
        <Link to="/signin" state={{ from: { pathname: '/cart' } }} className={styles.btnPlaceOrder}>
          Sign in to checkout
        </Link>
      </div>
    );

  const field = (name, label, autocomplete, required = true, type = 'text') => (
    <div className={styles.formGroup}>
      <label className={styles.label} htmlFor={`checkout-${name}`}>
        {label}
      </label>
      <input
        id={`checkout-${name}`}
        name={name}
        type={type}
        autoComplete={autocomplete}
        value={values[name]}
        onChange={change(name)}
        required={required}
        className={styles.input}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className={styles.checkoutForm}>
      {values.error && (
        <div className={styles.errorAlert} role="alert">
          {values.error}
        </div>
      )}
      <h3 className={styles.shippingHeading}>Delivery address</h3>
      {field('customer_name', 'Recipient name', 'name')}
      {field('customer_email', 'Email address', 'email', true, 'email')}
      {field('street', 'Street address', 'street-address')}
      <div className={styles.rowTwo}>
        {field('city', 'City', 'address-level2')}
        {field('state', 'State', 'address-level1', false)}
      </div>
      <div className={styles.rowTwo}>
        {field('zipcode', 'Postal code', 'postal-code')}
        {field('country', 'Country', 'country-name')}
      </div>
      <h3 className={styles.shippingHeading}>Payment details</h3>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Credit or debit card</label>
        <div className={styles.cardElementBox}>
          <CardElement
            options={{
              style: {
                base: { fontSize: '16px', color: '#293126', '::placeholder': { color: '#a4ad98' } },
                invalid: { color: '#b66b45' },
              },
            }}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={values.loading || !stripe || !elements || !cartItems.length}
        className={styles.btnPlaceOrder}
      >
        {values.loading ? 'Placing order…' : 'Place Order'}
      </button>
    </form>
  );
}
