import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { create } from '../../api/api-shop';
import styles from './Shop.module.css';

export default function NewShop() {
  const navigate = useNavigate();

  const authData = auth.isAuthenticated();

  const [values, setValues] = useState({
    name: '',
    description: '',
    error: '',
    loading: false,
  });

  const handleChange = name => event =>
    setValues(previous => ({ ...previous, [name]: event.target.value, error: '' }));

  const handleSubmit = async e => {
    e.preventDefault();
    setValues({ ...values, loading: true });

    let shopData = new FormData();
    values.name && shopData.append('name', values.name);
    values.description && shopData.append('description', values.description);

    const data = await create({ userId: authData.user._id }, { t: authData.token }, shopData);
    if (data && data.error) {
      setValues({ ...values, error: data.error, loading: false });
    } else {
      navigate('/seller/shops');
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Create New Shop</h1>
        <p className={styles.subtitle}>Set up a branded storefront for your merchandise</p>

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
              placeholder="e.g. Nordic Ceramics Studio"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              value={values.description}
              onChange={handleChange('description')}
              rows="4"
              className={styles.textarea}
              placeholder="Tell buyers about your shop and craft..."
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" disabled={values.loading} className={styles.btnSubmit}>
              {values.loading ? 'Creating...' : 'Launch Shop'}
            </button>
            <Link to="/seller/shops" className={styles.btnCancel}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
