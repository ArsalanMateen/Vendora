import BackLink from '../../components/BackLink';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import styles from './User.module.css';

export default function StripeConnect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState('Connecting your Stripe account...');
  const [error, setError] = useState('');

  const authData = auth.isAuthenticated();

  useEffect(() => {
    const code = searchParams.get('code');
    const err = searchParams.get('error') || searchParams.get('error_description');

    if (err) {
      setError('Stripe connection was not completed: ' + err);
      return;
    }

    if (!code) {
      setError('Missing authorization code from Stripe.');
      return;
    }

    if (!authData) {
      navigate('/signin', { state: { from: { pathname: '/seller/stripe/connect' } } });
      return;
    }

    fetch('/api/stripe_auth/' + authData.user._id + '?code=' + code, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + authData.token,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.error) {
          setError(data.error);
        } else {
          setStatus('Stripe account connected successfully!');
          auth.updateUser(data, () => {
            setTimeout(() => {
              navigate('/user/' + authData.user._id);
            }, 1500);
          });
        }
      })
      .catch(err => {
        setError('Network error: ' + err.message);
      });
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Stripe Connect Onboarding</h1>
        {error ? (
          <div>
            <div className={styles.errorAlert}>{error}</div>
            <BackLink to={authData ? '/user/' + authData.user._id : '/'}>Back to profile</BackLink>
          </div>
        ) : (
          <div>
            <p className={styles.metaInfo}>{status}</p>
            <div className={styles.loading}>Finalizing your merchant credentials...</div>
          </div>
        )}
      </div>
    </div>
  );
}
