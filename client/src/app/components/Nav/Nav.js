import Link from 'next/link';
import styles from './Nav.module.css';

const Nav = () => {
  return (
    <nav className={styles.Nav}>
      <div className={styles.id}>
        <div className={styles.logo}></div>
        <Link href="/dashboard">STELLAR</Link>
      </div>
      <ul>
        <li>
          <Link href="/auto-journey">Auto</Link>
        </li>
        <li>
          <Link href="/account">Account</Link>
        </li>
      </ul>
    </nav>
  );
};
export default Nav;
