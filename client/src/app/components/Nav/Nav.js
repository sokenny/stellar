'use client';

import { useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import { signIn, signOut, useSession } from 'next-auth/react';
import useStore from '../../store';
import Link from 'next/link';
import FullPageLoader from '../FullPageLoader';
import styles from './Nav.module.css';

const Nav = () => {
  const { data: session, status } = useSession();
  const { setProjects, setCurrentProject, currentProject } = useStore();
  const initializedProjects = useRef(false);

  // TODO-p1-1: Only initialize projects here if a user is logged in. So that unauthflow for onboardings can setProjects with their one project (without having an acc)
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
    <>
      {(session === undefined || (session && !currentProject.id)) && (
        <FullPageLoader />
      )}
      <Toaster richColors />
      <nav className={styles.Nav}>
        <div className={styles.id}>
          <div className={styles.logo}></div>
          <Link href={session ? '/dashboard' : '/'}>STELLAR</Link>
        </div>
        <ul>
          {!session && (
            <>
              <li className={styles.tab}>
                <Link href="/pricing">Pricing</Link>
              </li>
              <li className={styles.tab}>
                <Link href="/changelog">Changelog</Link>
              </li>
            </>
          )}
        </ul>
        <div className={styles.access}>
          {session ? (
            <div
              className={styles.logout}
              onClick={() => {
                signOut();
              }}
            >
              Log out
            </div>
          ) : (
            <div
              className={styles.login}
              onClick={() => {
                signIn('google', {
                  callbackUrl: '/dashboard',
                });
              }}
            >
              Log in
            </div>
          )}
        </div>
      </nav>
    </>
  );
};
export default Nav;
