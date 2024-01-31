'use client';

import { useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import useStore from '../../store';
import Link from 'next/link';
import styles from './Nav.module.css';

const Nav = () => {
  const { setProjects, setCurrentProject } = useStore();
  const initializedProjects = useRef(false);

  async function initializeProjects() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STELLAR_API}/projects/1`,
      {
        cache: 'no-store',
      },
    );

    const projects = await response.json();
    setProjects(projects);
    setCurrentProject(projects[0]);
  }

  useEffect(() => {
    if (!initializedProjects.current) {
      initializeProjects();
      initializedProjects.current = true;
    }
  }, []);

  return (
    <nav className={styles.Nav}>
      <Toaster richColors position="top-center" />
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
