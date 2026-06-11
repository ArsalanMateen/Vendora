import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { read, update } from '../../api/api-user';
import styles from './User.module.css';
import Icon from '../../components/Icon';

export default function EditProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const authData = auth.isAuthenticated();

  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    seller: false,
    error: '',
    loading: true,
  });

  useEffect(() => {
    const abortController = new AbortController();
    read({ userId }, { t: authData.token }, abortController.signal).then(data => {
      if (abortController.signal.aborted) return;
      if (data && data.error) {
        navigate('/signin');
      } else if (data) {
        setValues(prev => ({
          ...prev,
          name: data.name,
          email: data.email,
          seller: data.seller || false,
          loading: false,
        }));
      } else
        setValues(previous => ({
          ...previous,
          loading: false,
          error: 'We couldn’t load your profile. Please refresh to try again.',
        }));
    });

    return () => abortController.abort();
  }, [userId]);

  const handleChange = name => e => {
    const val = name === 'seller' ? e.target.checked : e.target.value;
    setValues({ ...values, [name]: val, error: '' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const user = {
      name: values.name,
      email: values.email,
      seller: values.seller,
    };
    if (values.password) user.password = values.password;

    const data = await update({ userId }, { t: authData.token }, user);
    if (!data || data.error) {
      setValues({
        ...values,
        error: data?.error || 'We couldn’t save your profile. Please try again.',
      });
    } else {
      auth.updateUser(data, () => {
        navigate('/user/' + data._id);
      });
    }
  };

  if (values.loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Edit Profile</h1>

        {values.error && <div className={styles.errorAlert}>{values.error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              value={values.name}
              onChange={handleChange('name')}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={values.email}
              onChange={handleChange('email')}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="profile-password" className={styles.label}>
              Password
            </label>
            <input
              id="profile-password"
              aria-describedby="profile-password-help"
              autoComplete="new-password"
              type="password"
              value={values.password}
              onChange={handleChange('password')}
              className={styles.input}
              placeholder="New password"
            />
            <p id="profile-password-help" className={styles.fieldHint}>
              <Icon name="info" size={15} />
              <span>Leave this field empty to keep your current password.</span>
            </p>
          </div>

          {/* Seller Toggle - Core Chapter 7 Feature */}
          <div className={styles.sellerToggleGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={values.seller}
                onChange={handleChange('seller')}
                className={styles.checkbox}
              />
              <span>
                <strong>Seller Account</strong>
              </span>
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.btnSave}>
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate('/user/' + userId)}
              className={styles.btnCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
