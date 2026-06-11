

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { read } from '../../api/api-user';



import IconAction from '../../components/IconAction';

import styles from './User.module.css';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const account = auth.isAuthenticated();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSelf = account?.user?._id === userId;

  
  

  
  

  

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    read({ userId }, { t: account.token }, controller.signal).then(profile => {
      if (controller.signal.aborted) return;
      if (profile?.error) {
        navigate('/signin');
        return;
      }
      if (!profile?._id) {
        setError('We couldn’t load your profile. Please try again.');
        setLoading(false);
        return;
      }
      setUser(profile);
      setLoading(false);
    });

    return () => controller.abort();
  }, [userId]);

  useEffect(() => {
    if (!loading && location.hash === '#orders')
      document.getElementById('orders')?.scrollIntoView({ block: 'start' });
  }, [loading, location.hash]);

  if (loading) return <div className={styles.loading}>Loading profile…</div>;
  if (error || !user)
    return (
      <div className={styles.loading} role="alert">
        {error}
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <header className={styles.profileHeader}>
          <div className={styles.profileIdentity}>
            <h1 className={styles.name}>{user.name}</h1>
            <p className={styles.email}>{user.email}</p>
          </div>
          <div className={styles.profileTools}>
            <span className={styles.accountBadge}>
              {user.seller ? 'Seller account' : 'Buyer account'}
            </span>
            {isSelf && (
              <IconAction to={`/user/edit/${user._id}`} icon="edit" label="Edit profile" />
            )}
          </div>
        </header>
        
        
      </div>
    </div>
  );
}
