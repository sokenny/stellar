'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { signOut, useSession } from 'next-auth/react';
import useStore from '../../store';
import Link from 'next/link';
import FullPageLoader from '../FullPageLoader';
import ErrorModal from '../Modals/ErrorModal';
import CreateNewProjectModal from '../Modals/CreateNewProjectModal';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  cn,
} from '@nextui-org/react';
import AddNote from '../../icons/AddNote';
import DownArrow from '../../icons/DownArrow';
import Avatar from '../../icons/Avatar';
import segmentIdentify from '../../helpers/segment/segmentIdentify';
import styles from './Nav.module.css';
import segmentTrack from '../../helpers/segment/segmentTrack';

const Nav = ({ token }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { data: session } = useSession();
  const {
    user,
    currentProject,
    setProjects,
    setCurrentProject,
    setSession,
    setToken,
    setUser,
    errorModal,
    getLastSelectedProject,
  } = useStore();
  const initializedProjects = useRef(false);
  const variantEditedEffectRan = useRef(false);

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

    if (!user?.onboardingAnswer && !pathname.includes('onboarding')) {
      router.push('/onboarding');
      return;
    }

    if (pathname.includes('onboarding') && user?.onboardingAnswer) {
      router.push('/dashboard');
      return;
    }

    segmentIdentify(user.id, {
      ...user,
    });
    setSession(session);
    setUser(user);
    setProjects(user.projects);

    const lastSelectedProject = getLastSelectedProject();

    if (
      lastSelectedProject &&
      user.projects.some((p) => p.id == lastSelectedProject)
    ) {
      setCurrentProject(user.projects.find((p) => p.id == lastSelectedProject));
    } else if (user.projects.length > 0) {
      setCurrentProject(user.projects[0]);
    }

    initializedProjects.current = true;
  }

  useEffect(() => {
    if (!variantEditedEffectRan.current) {
      const urlParams = new URLSearchParams(window.location.search);
      const variantEdited = urlParams.get('variantEdited');
      if (variantEdited) {
        toast.success('Variant modified successfully!');
        urlParams.delete('variantEdited');
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
      variantEditedEffectRan.current = true;
    }
  }, []);

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

  const {
    isOpen: isCreateNewProjectModalOpen,
    onOpen: onOpenCreateNewProjectModal,
    onOpenChange: onOpenCreateNewProjectModalChange,
  } = useDisclosure();

  const tabs = [
    { name: 'Dashboard', path: '/dashboard', isAuth: true, when: isHome },
    { name: 'Pricing', path: '/#pricing', isAuth: false, when: true },
  ];

  const iconClasses =
    'text-xl text-default-500 pointer-events-none flex-shrink-0';

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
      {isCreateNewProjectModalOpen && (
        <CreateNewProjectModal
          isOpen={isCreateNewProjectModalOpen}
          onOpenChange={onOpenCreateNewProjectModalChange}
          onOpen={onOpenCreateNewProjectModal}
        />
      )}
      <Navbar maxWidth="full" className={styles.container}>
        <NavbarBrand className={styles.identity}>
          <Link href={session ? '/dashboard' : '/'}>
            <div className={styles.id}>
              <img
                src="/stellar-logo.png"
                alt="Stellar"
                style={{ height: 18 }}
              />
              {/* <img
                src="/Logo_CMYK_icon_blue.png"
                alt="Stellar"
                style={{ height: 38 }}
              /> */}
              Stellar
            </div>
          </Link>
        </NavbarBrand>
        {currentProject && !isHome && (
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                size="sm"
                endContent={
                  <div className={styles.downArrow}>
                    <DownArrow />
                  </div>
                }
              >
                {currentProject?.name}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              variant="faded"
              aria-label="Dropdown menu with description"
            >
              {user?.projects.map((project) => {
                if (project.id === currentProject.id) return null;
                return (
                  <DropdownItem
                    key={project.id}
                    onClick={() => {
                      router.push('/dashboard');
                      setCurrentProject(project);
                    }}
                    showDivider={
                      project.id ===
                      user?.projects[user?.projects.length - 1].id
                    }
                  >
                    {project.name}
                  </DropdownItem>
                );
              })}
              <DropdownItem
                key="new"
                description="Create a new project"
                startContent={<AddNote className={iconClasses} />}
                onClick={onOpenCreateNewProjectModal}
              >
                New project
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
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
        {!session && (
          <NavbarContent justify="end">
            <NavbarItem className={`hidden lg:flex ${styles.navItem}`}>
              <div onClick={() => router.push('/login')}>Login</div>
            </NavbarItem>
            <NavbarItem className={styles.navItem}>
              <Button
                onClick={() => router.push('/signup')}
                color="primary"
                variant="flat"
              >
                Sign Up
              </Button>
            </NavbarItem>
          </NavbarContent>
        )}
        {session && (
          <NavbarContent as="div" justify="end">
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <div>
                  <Avatar width={30} height={30} className={styles.avatar} />
                </div>
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem
                  key="profile"
                  className="h-14 gap-2"
                  onClick={() => router.push('/dashboard')}
                >
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{session?.user?.email}</p>
                </DropdownItem>
                {isHome && (
                  <DropdownItem
                    key="go-to-app"
                    onClick={() => router.push('/dashboard')}
                  >
                    Go to App
                  </DropdownItem>
                )}
                <DropdownItem
                  key="account"
                  onClick={() => router.push('/account')}
                >
                  Account
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  onClick={() => signOut()}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarContent>
        )}
      </Navbar>
      <div className={styles.statusBar} data-testid="status-bar">
        <div>
          #1 Fastest on the market.{' '}
          <a
            href="https://forms.gle/h2ytTVbdYLH5ZWKs9"
            target="_blank"
            rel="noopener noreferrer"
          >
            Leave us your feedback 📝
          </a>
        </div>
      </div>
    </>
  );
};
export default Nav;
