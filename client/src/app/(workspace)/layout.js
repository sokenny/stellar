import '../globals.css';
import Link from 'next/link';
import Sidebar from './Sidebar/Sidebar';
import styles from './layout.module.css';

export default function WorkspaceLayout({ children }) {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
