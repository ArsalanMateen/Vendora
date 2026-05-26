import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { read, update } from '../../api/api-shop';
import MyProducts from '../product/MyProducts';
import styles from './Shop.module.css';

export default function EditShop() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const authData = auth.isAuthenticated();

  const [values, setValues] = useState({
    name: '',
    description: '',
    error: '',
    loading: true,
  });

  useEffect(() => {
    const abortController = new AbortController();
    read({ shopId }, abortController.signal).then(data => {
      if (data && !data.error) {
        setValues(prev => ({
          ...prev,
          name: data.name,
          description: data.description || '',
          loading: false,
        }));
      } else if (data && data.error) {
        navigate('/seller/shops');
      }
    });

    return () => abortController.abort();
  }, [shopId]);

  const handleChange = name => event =>
    setValues(previous => ({ ...previous, [name]: event.target.value, error: '' }));

  const handleSubmit = async e => {
    e.preventDefault();
    let shopData = new FormData();
    values.name && shopData.append('name', values.name);
    values.description && shopData.append('description', values.description);

    const data = await update({ shopId }, { t: authData.token }, shopData);
    if (data && data.error) {
      setValues({ ...values, error: data.error });
    } else {
      navigate('/seller/shops');
    }
  };

  if (values.loading) return <div className={styles.loading}>Loading shop details...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.editLayout}>
        <div className={styles.formCard}>
          <h2 className={styles.title}>Edit Shop Details</h2>

          {values.error && <div className={styles.errorAlert}>{values.error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Shop Name</label>
              <input
                type="text"
                value={values.name}
                onChange={handleChange('name')}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea
                value={values.description}
                onChange={handleChange('description')}
                rows="4"
                className={styles.textarea}
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.btnSubmit}>
                Update Shop
              </button>
            </div>
          </form>
        </div>

        {/* Product Inventory Management for this Shop */}
        <div className={styles.inventorySection}>
          <MyProducts shopId={shopId} />
        </div>
      </div>
    </div>
  );
}
