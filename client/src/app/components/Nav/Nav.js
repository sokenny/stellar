'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { signIn, signOut, useSession } from 'next-auth/react';
import useStore from '../../store';
import Link from 'next/link';
import FullPageLoader from '../FullPageLoader';
import styles from './Nav.module.css';
import { user } from '@nextui-org/react';

const Nav = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { setProjects, setCurrentProject, setSession, setUser } = useStore();
  const initializedProjects = useRef(false);

  async function initializeProjects() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STELLAR_API}/projects/${session.user.email}`,
      {
        cache: 'no-store',
      },
    );

    const user = await response.json();
    setProjects(user.projects);
    setCurrentProject(user.projects[0] || {});
    setSession(session);
    setUser(user);
  }

  useEffect(() => {
    if (
      !initializedProjects.current &&
      session &&
      session.user.email &&
      !user.projects // Right now this is our flag to know if the user finished onboarding
    ) {
      initializeProjects();
      initializedProjects.current = true;
    }

    if (!user.projects) {
      initializedProjects.current = false;
    }
  }, [initializedProjects, session, pathname]);

  return (
    <>
      {session === undefined && <FullPageLoader />}
      <Toaster richColors position="bottom-right" />
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
                  callbackUrl: '/dashboard?juanito=banana',
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
