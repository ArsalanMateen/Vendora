import { useState } from 'react';
import { Link } from 'react-router-dom';
import { create } from '../../api/api-user';
import Icon from '../../components/Icon';
import AuthLayout from './AuthLayout';
import styles from './Auth.module.css';

export default function Signup() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    seller: false,
    error: '',
    success: false,
  });
  const [pending, setPending] = useState(false);

  const handleChange = name => event =>
    setValues(previous => ({ ...previous, [name]: event.target.value, error: '' }));

  const handleSubmit = async event => {
    event.preventDefault();
    setPending(true);
    const { name, email, password, seller } = values;
    const data = await create({ name, email, password, seller });
    setPending(false);
    if (data?.error || !data)
      setValues(previous => ({
        ...previous,
        error: data?.error || 'We couldn’t create your account. Please try again.',
      }));
    else setValues(previous => ({ ...previous, password: '', error: '', success: true }));
  };

  return (
    <AuthLayout>
      <p className="page-kicker">YOUR NEXT CHAPTER STARTS HERE</p>
      <h1 className={styles.title}>
        {values.success ? 'Make yourself at home.' : 'A little more you.'}
      </h1>
      <p className={styles.subtitle}>
        {values.success
          ? 'Your account is ready. Sign in to start exploring.'
          : 'Create your account and discover what’s possible.'}
      </p>
      {values.error && (
        <div className={styles.errorAlert} role="alert">
          {values.error}
        </div>
      )}
      {values.success ? (
        <div className={styles.successAlert} role="status">
          <Icon name="check" size={20} />
          <p>Welcome to Vendora, {values.name}.</p>
          <Link to="/signin" className={styles.btnSubmit}>
            Sign in to your account
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="signup-name" className={styles.label}>
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={handleChange('name')}
              required
              className={styles.input}
              placeholder="Your name"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="signup-email" className={styles.label}>
              Email address
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={handleChange('email')}
              required
              className={styles.input}
              placeholder="you@example.com"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="signup-password" className={styles.label}>
              Password
            </label>
            
<input id="signup-password" type="password" autoComplete="new-password" value={values.password} onChange={handleChange('password')} required minLength={6} className={styles.input} />
          </div>
          <label className={styles.sellerOption}>
            <input
              type="checkbox"
              checked={values.seller}
              onChange={event =>
                setValues(previous => ({ ...previous, seller: event.target.checked }))
              }
            />
            <span>
              I’d like to sell on Vendora<small>Get access to your own seller studio.</small>
            </span>
            <Icon name="shop" size={19} />
          </label>
          <button type="submit" className={styles.btnSubmit} disabled={pending}>
            {pending ? 'Creating your account…' : 'Create account'}
          </button>
        </form>
      )}
      <p className={styles.switchText}>
        Already part of the community?{' '}
        <Link to="/signin" className={styles.switchLink}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
