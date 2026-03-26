import { Link } from "react-router-dom";
import Icon from "./Icon";
import styles from "./BackLink.module.css";

export default function BackLink({ children, className = "", ...props }) {
  return (
    <Link {...props} className={`${styles.link} ${className}`}>
      <Icon name="arrowLeft" size={16} className={styles.arrow} />
      {children}
    </Link>
  );
}
