'use client';
import { useRouter } from 'next/navigation';
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
import segmentIdentify from '../../helpers/segment/segmentIdentify';
import styles from './Nav.module.css';
import segmentTrack from '../../helpers/segment/segmentTrack';

const Nav = ({ token }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';
  console.log('Pathname! ', pathname);
  const { data: session } = useSession();
  const {
    currentProject,
    setProjects,
    setCurrentProject,
    setSession,
    setToken,
    setUser,
    errorModal,
  } = useStore();
  const initializedProjects = useRef(false);

  async function initializeProjects() {
    setToken(token);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STELLAR_API}/api/projects/${session.user.email}`,
      {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const user = await response.json();
    segmentIdentify(user.id, {
      ...user,
    });
    setProjects(user?.projects);
    setCurrentProject(user?.projects[0] || null);
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

    if (!currentProject) {
      initializedProjects.current = false;
    }
  }, [initializedProjects, session, pathname, currentProject]);

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
    { name: 'Dashboard', path: '/dashboard', isAuth: true, when: isHome },
  ];
  return (
    <>
      {session === undefined && !isHome && <FullPageLoader />}
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
          <Link href={session ? '/dashboard' : '/'}>Stellar</Link>
        </NavbarBrand>
        {currentProject && !isHome && (
          <div
            className={styles.project}
            onClick={() => {
              router.push('/dashboard');
            }}
          >
            Project: <span>{currentProject?.name}</span>
          </div>
        )}
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {tabs.map((tab, i) => {
            const isActive = tab.path === pathname;
            if (tab.isAuth && !session) return null;
            if (!tab.isAuth && session) return null;
            if (tab.when === false) return null;
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
                      callbackUrl: '/dashboard',
                    })
                  }
                >
                  Login
                </div>
              </NavbarItem>
              <NavbarItem className={styles.navItem}>
                <Button
                  onClick={() => {
                    segmentTrack('click_sign_up', {
                      location: 'nav',
                    });
                    signIn('google', {
                      callbackUrl: '/dashboard',
                    });
                  }}
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
      <div className={styles.statusBar}>
        <div>
          Currently on limited open beta.{' '}
          <a
            href="https://forms.gle/h2ytTVbdYLH5ZWKs9"
            target="_blank"
            rel="noopener noreferrer"
          >
            Leave us your feedback 📝
          </a>
          <a
            href="https://discord.gg/62krmWQ4ae"
            target="_blank"
            rel="noopener noreferrer"
          >
            Engage with us on Discord 🙌
          </a>
        </div>
      </div>
    </>
  );
};
export default Nav;
