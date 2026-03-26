import IconAction from "../../components/IconAction";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import auth from "../../auth/auth-helper";
import { listByOwner } from "../../api/api-shop";
import DeleteShop from "../../components/DeleteShop";

import Icon from "../../components/Icon";
import styles from "./Shop.module.css";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function MyShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  const authData = auth.isAuthenticated();

  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);
    setError("");
    listByOwner(
      { userId: authData.user._id },
      { t: authData.token },
      abortController.signal,
    ).then((data) => {
      if (abortController.signal.aborted) return;
      if (Array.isArray(data)) {
        setShops(data);
      } else {
        setError(data?.error || "We couldn’t load your shops. Please try again.");
      }
      setLoading(false);
    });

    return () => abortController.abort();
  }, [authData.token, authData.user._id, revision]);

  const handleDeleted = (deletedId) => {
    setShops(shops.filter((s) => s._id !== deletedId));
  };

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

      {loading ? (
        <div className={styles.loading} aria-busy="true">
          <LoadingSpinner label="Loading your shops…" />
        </div>
      ) : error ? (
        <div className={styles.emptyCard} role="alert">
          <p className={styles.emptyText}>{error}</p>
          <button onClick={() => setRevision((value) => value + 1)}>
            Try again
          </button>
        </div>
      ) : shops.length === 0 ? (
        <div className={styles.emptyCard}>
          <p className={styles.emptyText}>
            You haven't launched any shops yet.
          </p>
        </div>
      ) : (
        <div className={styles.myShopsList}>
          {shops.map((shop) => (
            <div key={shop._id} className={styles.myShopItem}>
              <div className={styles.myShopLeft}>
                <div>
                  <Link
                    to={"/seller/shop/edit/" + shop._id}
                    className={styles.myShopTitle}
                  >
                    {shop.name}
                  </Link>
                  <p className={styles.myShopDesc}>{shop.description}</p>
                </div>
              </div>

              <div className={styles.myShopActions}>
                <IconAction
                  to={"/seller/orders/" + shop._id}
                  icon="box"
                  label={"View orders for " + shop.name}
                />
                <IconAction
                  to={"/shops/" + shop._id}
                  icon="eye"
                  label={"View " + shop.name}
                />
                <IconAction
                  to={"/seller/shop/edit/" + shop._id}
                  icon="edit"
                  label={"Manage " + shop.name}
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
