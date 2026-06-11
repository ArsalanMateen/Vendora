import { Link, NavLink } from 'react-router-dom';
import auth from '../auth/auth-helper';
import { useCommerce } from '../state/CommerceProvider';
import Icon from './Icon';
import styles from './Navbar.module.css';
export default function Navbar() {
  const account = auth.isAuthenticated();
  const {
    cart,
    savedIds
  } = useCommerce();
  return <><aside className={styles.sidebar}>
    <Link to="/" className={styles.brand}>Vendora</Link>
    <nav className={styles.navigation}>
      <NavLink to="/">Discover</NavLink>
      <NavLink to="/shops/all">Shops</NavLink>
      <NavLink to="/auctions/all">Auctions</NavLink>
      <NavLink to="/saved">Saved ({savedIds.length})</NavLink>
      <NavLink to="/cart">Shopping bag ({cart.length})</NavLink>
      {account?.user?.seller && <><NavLink to="/seller/shops">My storefronts</NavLink><NavLink to="/myauctions">My auctions</NavLink></>}
    </nav>
  </aside><header className={styles.topbar}>
    <Link to={account ? '/user/' + account.user._id : '/signin'}>
      <Icon name="user" />Your account</Link>
  </header></>;
}
