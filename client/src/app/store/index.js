import { create } from 'zustand';

const useStore = create((set, get) => ({
  projects: [],
  isOnboarding: false,
  setIsOnboarding: (isOnboarding) => set({ isOnboarding }),
  setProjects: (projects) => set({ projects }),
  currentProject: {},
  setCurrentProject: (currentProject) => set({ currentProject }),
  stats: {},
  lastCallTimestamps: {}, // Track the last call timestamp for each experiment ID
  setStats: (experimentId, experimentStats) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [experimentId]: experimentStats,
      },
    })),
  getExperimentStats: async (experimentId) => {
    const state = get();
    const now = Date.now();
    const lastCallTimestamp = state.lastCallTimestamps[experimentId] || 0;

    if (now - lastCallTimestamp < 2000) {
      console.log(
        `Debounce active for experiment ${experimentId}, skipping fetch.`,
      );
      return state.stats[experimentId];
    }

    set((state) => ({
      lastCallTimestamps: {
        ...state.lastCallTimestamps,
        [experimentId]: now,
      },
    }));

    if (!state.stats[experimentId]) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experimentId}/stats`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        const data = await res.json();
        state.setStats(experimentId, data);
        return data;
      } catch (error) {
        console.error(
          `Failed to fetch stats for experiment ${experimentId}:`,
          error,
        );
        throw new Error('Failed to fetch experiment stats.');
      }
    } else {
      return state.stats[experimentId];
    }
  },
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
