import BackLink from '../../components/BackLink';
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import auth from '../../auth/auth-helper';
import { signin } from '../../api/api-auth';
import Icon from '../../components/Icon';
import AuthLayout from './AuthLayout';
import styles from './Auth.module.css';

export default function Signin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '', error: '' });
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = name => event =>
    setValues(previous => ({ ...previous, [name]: event.target.value, error: '' }));

  const handleSubmit = async event => {
    event.preventDefault();
    setPending(true);
    const data = await signin({ email: values.email, password: values.password });
    setPending(false);
    if (data?.token && data?.user) {
      auth.authenticate(data, () => {
        const from = location.state?.from;
        navigate(from ? `${from.pathname}${from.search || ''}${from.hash || ''}` : '/', {
          replace: true,
        });
      });
    } else
      setValues(previous => ({
        ...previous,
        error: data?.error || 'We couldn’t sign you in. Please try again.',
      }));
  };

  return (
    <AuthLayout>
      <p className="page-kicker">YOUR VENDORA ACCOUNT</p>
      <h1 className={styles.title}>Good to see you again.</h1>
      <p className={styles.subtitle}>Sign in and pick up where you left off.</p>
      {values.error && (
        <div className={styles.errorAlert} role="alert">
          {values.error}
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="signin-email" className={styles.label}>
            Email address
          </label>
          <input
            id="signin-email"
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
          <label htmlFor="signin-password" className={styles.label}>
            Password
          </label>
          <div className={styles.passwordField}>
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange('password')}
              required
              className={styles.input}
              placeholder="Enter your password"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(value => !value)}
            >
              <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </div>
        </div>
        <button type="submit" className={styles.btnSubmit} disabled={pending}>
          {pending ? 'Signing you in…' : 'Sign in'}
        </button>
      </form>
      <p className={styles.switchText}>
        New around here?{' '}
        <Link to="/signup" className={styles.switchLink}>
          Create an account
        </Link>
      </p>
      <div className={styles.backNavigation}>
        <BackLink to="/">Back to Discover</BackLink>
      </div>
    </AuthLayout>
  );
}
