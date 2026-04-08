import { Link } from 'react-router-dom';
import styles from './BackLink.module.css';

export default function BackLink({ children, className = '', ...props }) {
  return (
    <Link {...props} className={`${styles.link} ${className}`}>
      {children}
    </Link>
  );
}
