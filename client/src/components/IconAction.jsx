import { Link } from 'react-router-dom';
import Icon from './Icon';
import styles from './IconAction.module.css';

export default function IconAction({ to, icon, label, danger = false, ...props }) {
  const shared = {
    ...props,
    className: `${styles.action} ${danger ? styles.danger : ''}`,
    'aria-label': label,
    title: label,
  };

  return to ? (
    <Link {...shared} to={to}>
      <Icon name={icon} size={18} />
    </Link>
  ) : (
    <button type="button" {...shared}>
      <Icon name={icon} size={18} />
    </button>
  );
}
