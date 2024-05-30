'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import { signIn, signOut, useSession } from 'next-auth/react';
import useStore from '../../store';
import Link from 'next/link';
import FullPageLoader from '../FullPageLoader';
import ErrorModal from '../Modals/ErrorModal';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  useDisclosure,
} from '@nextui-org/react';
import styles from './Nav.module.css';

// TODO-p2: Add breadcrumb to experiment/:id page
const Nav = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const {
    setProjects,
    setCurrentProject,
    setSession,
    setUser,
    errorModal,
    // setErrorModal,
  } = useStore();
  const initializedProjects = useRef(false);

  async function initializeProjects() {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STELLAR_API}/projects/${session.user.email}`,
      {
        cache: 'no-store',
      },
    );

    const user = await response.json();
    setProjects(user?.projects);
    setCurrentProject(user?.projects[0] || {});
    setSession(session);
    setUser(user);
  }

  useEffect(() => {
    if (
      !initializedProjects.current &&
      session &&
      session.user.email &&
      !session?.user?.projects // Right now this is our flag to know if the user finished onboarding
    ) {
      initializeProjects();
      initializedProjects.current = true;
    }

    if (!session?.user?.projects) {
      initializedProjects.current = false;
    }
  }, [initializedProjects, session, pathname]);

  useEffect(() => {
    if (errorModal) {
      onOpenErrorModal();
    }
  }, [errorModal]);

  const {
    isOpen: isErrorModalOpen,
    onOpenChange: onOpenErrorModalChange,
    onOpen: onOpenErrorModal,
  } = useDisclosure();

  const tabs = [
    { name: 'changelog', path: '/changelog', isAuth: false },
    { name: 'pricing', path: '/pricing', isAuth: false },
  ];
  return (
    <>
      {session === undefined && <FullPageLoader />}
      <Toaster richColors position="bottom-right" />
      {errorModal && (
        <ErrorModal
          isOpen={isErrorModalOpen}
          onOpenChange={onOpenErrorModalChange}
          message={errorModal}
        />
      )}
      <Navbar maxWidth="full" className={styles.container}>
        <NavbarBrand className={styles.identity}>
          <Link href={session ? '/dashboard' : '/'}>STELLAR</Link>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {tabs.map((tab, i) => {
            const isActive = tab.path === pathname;
            if (tab.isAuth && !session) return null;
            if (!tab.isAuth && session) return null;
            return (
              <NavbarItem
                key={i}
                isActive={isActive}
                className={
                  styles.navItem + ' ' + (isActive ? styles.active : '')
                }
              >
                <Link href={tab.path}>{tab.name}</Link>
              </NavbarItem>
            );
          })}
        </NavbarContent>
        <NavbarContent justify="end">
          {session ? (
            <NavbarItem
              className={`hidden lg:flex ${styles.navItem}`}
              onClick={() => signOut()}
            >
              <div href="#">Log Out</div>
            </NavbarItem>
          ) : (
            <>
              <NavbarItem className={`hidden lg:flex ${styles.navItem}`}>
                <div
                  onClick={() =>
                    signIn('google', {
                      callbackUrl: '/dashboard?juanito=banana',
                    })
                  }
                >
                  Login
                </div>
              </NavbarItem>
              <NavbarItem className={styles.navItem}>
                <Button
                  onClick={() =>
                    signIn('google', {
                      callbackUrl: '/dashboard?juanito=banana',
                    })
                  }
                  color="primary"
                  variant="flat"
                >
                  Sign Up
                </Button>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>
    </>
  );
};
export default Nav;
