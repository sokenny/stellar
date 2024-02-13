import { create } from 'zustand';

const useStore = create((set) => ({
  projects: [],
  isOnboarding: false,
  setIsOnboarding: (isOnboarding) => set({ isOnboarding }),
  setProjects: (projects) => set({ projects }),
  currentProject: {},
  setCurrentProject: (currentProject) => set({ currentProject }),
  stats: {},
  setStats: (experimentId, experimentStats) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [experimentId]: experimentStats,
      },
    })),
  session: null,
  setSession: (session) => set({ session }),
  refetchProjects: async () => {
    const { session } = useStore.getState();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/projects/${session.user.email}`,
        {
          cache: 'no-store',
        },
      );
      const user = await response.json();
      console.log('projectardos: ', user.projects);
      set({ projects: user.projects, currentProject: user.projects[0] });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // Handle the error
    }
  },
  user: null,
  setUser: (user) => set({ user }),
}));

export default useStore;
