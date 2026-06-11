import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import auth from '../auth/auth-helper';
import { useCommerce } from '../state/CommerceProvider';
import Icon from './Icon';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const authData = auth.isAuthenticated();

  const { cart, savedIds } = useCommerce();

  const cartCount = cart.length;
  const savedCount = savedIds.length;

  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 900px)').matches);

  const sidebarRef = useRef(null);
  const menuRef = useRef(null);
  const accountRef = useRef(null);
  const accountButtonRef = useRef(null);
  const accountMenuRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');

    const sync = event => {
      setIsMobile(event.matches);
      if (!event.matches) setMenuOpen(false);
    };

    media.addEventListener('change', sync);

    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!accountOpen) return;
    accountMenuRef.current?.querySelector('[role="menuitem"]')?.focus();

    const outsideClick = event => {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    };

    const escape = event => {
      if (event.key === 'Escape') {
        setAccountOpen(false);
        accountButtonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', outsideClick);
    document.addEventListener('keydown', escape);

    return () => {
      document.removeEventListener('pointerdown', outsideClick);
      document.removeEventListener('keydown', escape);
    };
  }, [accountOpen]);

  const navigateAccountMenu = event => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const items = [...accountMenuRef.current.querySelectorAll('[role="menuitem"]')];
    const index = items.indexOf(document.activeElement);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  };

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    sidebarRef.current?.querySelector('a')?.focus();

    const onKey = event => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuRef.current?.focus();
      }
      if (event.key === 'Tab') {
        const items = sidebarRef.current?.querySelectorAll('a[href], button');
        const first = items?.[0];
        const last = items?.[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const accountPath = authData ? `/user/${authData.user._id}` : '/signin';

  const navItem = (to, icon, label, badge) => (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
    >
      <Icon name={icon} />
      <span>{label}</span>
      {badge > 0 && <span className={styles.count}>{badge}</span>}
    </NavLink>
  );

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {menuOpen && (
        <button
          className={styles.overlay}
          aria-label="Close navigation"
          onClick={() => {
            setMenuOpen(false);
            menuRef.current?.focus();
          }}
        />
      )}
      <aside
        ref={sidebarRef}
        inert={isMobile && !menuOpen ? '' : undefined}
        aria-hidden={(isMobile && !menuOpen) || undefined}
        className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}
        aria-label="Main navigation"
        role={menuOpen ? 'dialog' : undefined}
        aria-modal={menuOpen || undefined}
      >
        <div className={styles.brandRow}>
          <Link to="/" className={styles.brand} aria-label="Vendora home">
            <span className={styles.brandMark} aria-hidden="true">
              v<span />
            </span>
            <span aria-hidden="true">
              endora<span className={styles.brandDot}>.</span>
            </span>
          </Link>
          <button
            className={styles.mobileClose}
            aria-label="Close navigation"
            onClick={() => {
              setMenuOpen(false);
              menuRef.current?.focus();
            }}
          >
            <Icon name="close" />
          </button>
        </div>
        <nav className={styles.navigation}>
          <p className={styles.navLabel}>EXPLORE</p>
          {navItem('/', 'compass', 'Discover')}
          {navItem('/shops/all', 'shop', 'Shops')}
          {navItem('/auctions/all', 'gavel', 'Auctions')}
          <p className={styles.navLabel}>YOUR SPACE</p>
          {navItem('/saved', 'heart', 'Saved items', savedCount)}
          {navItem('/cart', 'bag', 'Shopping bag', cartCount)}
          {authData?.user?.seller && (
            <>
              <p className={styles.navLabel}>SELLER STUDIO</p>
              {navItem('/seller/shops', 'shop', 'My storefronts')}
              {navItem('/myauctions', 'gavel', 'My auctions')}
            </>
          )}
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.utilityLinks}>{navItem('/guide', 'help', 'Getting started')}</div>
        </div>
      </aside>
      <header className={styles.topbar}>
        <button
          ref={menuRef}
          className={styles.menuButton}
          onClick={() => {
            setAccountOpen(false);
            setMenuOpen(true);
          }}
          aria-label="Open navigation"
          aria-expanded={menuOpen}
        >
          <Icon name="menu" />
        </button>
        <div className={styles.topActions}>
          <Link
            to="/cart"
            className={styles.topBag}
            aria-label={`Shopping bag, ${cartCount} items`}
          >
            <Icon name="bag" size={21} />
            {cartCount > 0 && <span>{cartCount}</span>}
          </Link>
          <div
            className={styles.accountDropdown}
            ref={accountRef}
            onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget)) setAccountOpen(false);
            }}
          >
            <button
              id="account-menu-button"
              ref={accountButtonRef}
              className={styles.accountButton}
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              aria-controls="account-menu"
              onClick={() => setAccountOpen(value => !value)}
              onKeyDown={event => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setAccountOpen(true);
                }
              }}
            >
              <span className={styles.avatar}>
                {authData ? (
                  authData.user.name.charAt(0).toUpperCase()
                ) : (
                  <Icon name="user" size={18} />
                )}
              </span>
            </button>
            {accountOpen && (
              <div
                id="account-menu"
                ref={accountMenuRef}
                className={styles.accountMenu}
                role="menu"
                aria-labelledby="account-menu-button"
                onKeyDown={navigateAccountMenu}
              >
                <div className={styles.accountMenuHeader}>
                  <strong>{authData ? authData.user.name : 'Your account'}</strong>
                  {authData && (
                    <small>{authData.user.seller ? 'Seller account' : 'Personal account'}</small>
                  )}
                </div>
                {authData ? (
                  <>
                    <Link to={accountPath} role="menuitem">
                      My profile
                    </Link>
                    <Link to={`/user/edit/${authData.user._id}`} role="menuitem">
                      Account settings
                    </Link>
                    <Link to={`${accountPath}#orders`} role="menuitem">
                      My orders
                    </Link>
                    <div className={styles.menuDivider} role="separator" />
                    <button
                      role="menuitem"
                      className={styles.signOutItem}
                      onClick={() => {
                        setAccountOpen(false);
                        auth.clearJWT(() => navigate('/signin'));
                      }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/signin" role="menuitem">
                      Sign in
                    </Link>
                    <Link to="/signup" role="menuitem">
                      Create an account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
