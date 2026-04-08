import styles from './Auth.module.css';

export default function AuthLayout({ children }) {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>{children}</div>
    </div>
  );
}
