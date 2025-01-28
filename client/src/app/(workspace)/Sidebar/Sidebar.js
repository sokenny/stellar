'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from '../layout.module.css';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path) => {
    console.log(pathname, path);
    return pathname === path;
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <Link href="/dashboard">
          <div
            className={`${styles.menuItem} ${
              isActive('/dashboard') ? styles.active : ''
            }`}
          >
            Experiments
          </div>
        </Link>
        <Link href="/goals">
          <div
            className={`${styles.menuItem} ${
              isActive('/goals') ? styles.active : ''
            }`}
          >
            Goals
          </div>
        </Link>
        <Link href="/account">
          <div
            className={`${styles.menuItem} ${
              isActive('/account') ? styles.active : ''
            }`}
          >
            Projects
          </div>
        </Link>
      </div>
    </div>
  );
}
