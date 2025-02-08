import { create } from 'zustand';
import interceptFetch from '../helpers/interceptFetch';

async function fetchExperimentStats(experimentId, type) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experimentId}/stats/${type}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(
      `Failed to fetch stats for experiment ${experimentId}:`,
      error,
    );
    throw new Error('Failed to fetch experiment stats.');
  }
}

const useStore = create((set, get) => ({
  token: null,
  user: null,
  setToken: (token) => set({ token }),
  projects: [],
  isOnboarding: false,
  setIsOnboarding: (isOnboarding) => set({ isOnboarding }),
  setProjects: (projects) => set({ projects }),
  currentProject: null,
  setCurrentProject: (currentProject) => {
    set({ currentProject });
    localStorage.setItem('lastSelectedProject', currentProject.id);
    interceptFetch(currentProject?.id, get().token);
  },
  getLastSelectedProject: () => {
    const lastProject = localStorage.getItem('lastSelectedProject');
    return lastProject ? lastProject : null;
  },
  stats: {},
  lastCallTimestamps: {}, // Track the last call timestamp for each experiment ID
  setStats: (key, experimentStats) =>
    set((state) => ({
      stats: {
        ...state.stats,
        [key]: experimentStats,
      },
    })),
  getExperimentStats: async (experimentId, type = 'total-sessions') => {
    const expStatsKey = `${experimentId}-${type}`;
    const state = get();
    const now = Date.now();
    const lastCallTimestamp = state.lastCallTimestamps[expStatsKey] || 0;

    if (now - lastCallTimestamp < 2000) {
      return state.stats[expStatsKey];
    }

    set((state) => ({
      lastCallTimestamps: {
        ...state.lastCallTimestamps,
        [expStatsKey]: now,
      },
    }));

    if (!state.stats[expStatsKey]) {
      try {
        const data = await fetchExperimentStats(experimentId, type);
        state.setStats(expStatsKey, data);
        return data;
      } catch (error) {
        console.error(
          `Failed to fetch stats for experiment ${experimentId} - ${type}:`,
          error,
        );
        throw new Error('Failed to fetch experiment stats.');
      }
    } else {
      return state.stats[expStatsKey];
    }
  },
  charts: {},
  setCharts: (key, chartData) =>
    set((state) => ({
      charts: {
        ...state.charts,
        [key]: chartData,
      },
    })),
  session: null,
  setSession: (session) => set({ session }),
  refetchProjects: async () => {
    const { session } = useStore.getState();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/projects/${session.user.email}`,
        {
          cache: 'no-store',
        },
      );
      const user = await response.json();
      const lastSelectedProjectId = get().getLastSelectedProject();
      const projectToSet =
        user.projects.find((project) => project.id == lastSelectedProjectId) ||
        user.projects[0];

      // TODO-p2: Deprecar projects y setProjects / refetchProjects y que sea user y setUser, refetchUser
      set({
        user,
        projects: user.projects,
        currentProject: projectToSet,
      });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // Handle the error
    }
  },
  user: null,
  setUser: (user) => set({ user }),
  errorModal: null,
  setErrorModal: (errorModal) => set({ errorModal }),
  refetchExperiment: async (experimentId) => {
    console.log('refetching experiment', experimentId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experimentId}`,
        {
          cache: 'no-store',
        },
      );
      const updatedExperiment = await response.json();
      console.log('refetched exp response', updatedExperiment);

      set((state) => ({
        currentProject: {
          ...state.currentProject,
          experiments: state.currentProject.experiments.map((exp) => {
            if (exp.id == experimentId) {
              console.log('Experiment ID matched:', experimentId);
              return updatedExperiment;
            } else {
              console.log('Experiment ID did not match:', exp.id, experimentId);
              return exp;
            }
          }),
        },
      }));

      console.log('updatedExperiment', updatedExperiment);

      return updatedExperiment;
    } catch (error) {
      console.error('Failed to fetch experiment:', error);
      throw error;
    }
  },
}));

export default useStore;
