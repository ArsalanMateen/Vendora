import { Link } from 'react-router-dom';
import auth from '../auth/auth-helper';
import Icon from '../components/Icon';
import styles from './Guide.module.css';

export default function Guide() {
  const account = auth.isAuthenticated();
  const sellerPath = account?.user?.seller
    ? '/seller/shops'
    : account
      ? `/user/edit/${account.user._id}`
      : '/signup';

  return (
    <div className="page-container">
      <p className="page-kicker">MAKE YOURSELF AT HOME</p>
      <h1 className="page-title">A little help getting started.</h1>
      <p className="page-description">
        Find something you love, meet a new shop, or start a chapter of your own.
      </p>
      <div className={styles.grid}>
        <section className={styles.card}>
          <Icon name="compass" size={28} />
          <h2>Find your next favorite</h2>
          <p>
            Search the catalog, choose a category, or sort by price. Open a product to see its
            description, stock, and the shop behind it.
          </p>
          <Link to="/">Explore the marketplace</Link>
        </section>
        <section className={styles.card}>
          <Icon name="heart" size={28} />
          <h2>Keep the good finds</h2>
          <p>
            Save products with the heart button. Your collection lives on this device, and prices
            and availability are refreshed when you open it.
          </p>
          <Link to="/saved">Your saved items</Link>
        </section>
        <section className={styles.card}>
          <Icon name="bag" size={28} />
          <h2>Make it yours</h2>
          <p>
            Add available products to your shopping bag. Sign in at checkout, enter your shipping
            address, and complete your payment. Your orders appear in your account.
          </p>
          <Link to="/cart">Open your shopping bag</Link>
        </section>
        <section className={styles.card}>
          <Icon name="gavel" size={28} />
          <h2>Join the bidding</h2>
          <p>
            Explore live and upcoming auctions. Sign in to place a bid during the bidding window,
            and follow the activity on the auction page.
          </p>
          <Link to="/auctions/all">Explore auctions</Link>
        </section>
        <section className={styles.card}>
          <Icon name="shop" size={28} />
          <h2>Build your storefront</h2>
          <p>
            Create an account, enable the seller option in your profile, and open your first shop.
            Seller studio lets you manage products, orders, and auctions.
          </p>
          <Link to={sellerPath}>
            {account?.user?.seller ? 'Open seller studio' : 'Start your selling journey'}
          </Link>
        </section>
        <section className={styles.card}>
          <Icon name="shield" size={28} />
          <h2>Set up seller payments</h2>
          <p>
            Connect your Stripe account from your seller profile to receive customer payments.
            Manage storefront inventory and fulfillment from seller studio.
          </p>
          <Link to={account ? `/user/${account.user._id}` : '/signin'}>Go to your account</Link>
        </section>
      </div>
    </div>
  );
}
