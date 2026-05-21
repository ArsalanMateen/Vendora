import IconAction from '../../components/IconAction';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { listByOwner } from '../../api/api-shop';
import DeleteShop from '../../components/DeleteShop';

import Icon from '../../components/Icon';
import styles from './Shop.module.css';

export default function MyShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const authData = auth.isAuthenticated();

  useEffect(() => {
    const abortController = new AbortController();
    listByOwner({ userId: authData.user._id }, { t: authData.token }, abortController.signal).then(
      data => {
        if (data && !data.error) {
          setShops(data);
        }
        setLoading(false);
      }
    );

    return () => abortController.abort();
  }, []);

  const handleDeleted = deletedId => {
    setShops(shops.filter(s => s._id !== deletedId));
  };

  if (loading) return <div className={styles.loading}>Loading your shops...</div>;

  return (
    <div className={styles.container}>
      <p className="page-kicker">SELLER STUDIO</p>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Your storefronts, your story.</h1>
          <p className={styles.subtitle}>
            Manage your storefronts, list inventory, and fulfill orders
          </p>
        </div>
        <Link to="/seller/shop/new" className={styles.btnCreate}>
          <Icon name="shop" size={16} /> Create a storefront
        </Link>
      </div>

      {shops.length === 0 ? (
        <div className={styles.emptyCard}>
          <p className={styles.emptyText}>You haven't launched any shops yet.</p>
        </div>
      ) : (
        <div className={styles.myShopsList}>
          {shops.map(shop => (
            <div key={shop._id} className={styles.myShopItem}>
              <div className={styles.myShopLeft}>
                <div>
                  <Link to={'/seller/shop/edit/' + shop._id} className={styles.myShopTitle}>
                    {shop.name}
                  </Link>
                  <p className={styles.myShopDesc}>{shop.description}</p>
                </div>
              </div>

              <div className={styles.myShopActions}>
                <IconAction
                  to={'/seller/orders/' + shop._id}
                  icon="box"
                  label={'View orders for ' + shop.name}
                />
                <IconAction to={'/shops/' + shop._id} icon="eye" label={'View ' + shop.name} />
                <IconAction
                  to={'/seller/shop/edit/' + shop._id}
                  icon="edit"
                  label={'Manage ' + shop.name}
                />
                <DeleteShop shop={shop} onDeleted={handleDeleted} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
