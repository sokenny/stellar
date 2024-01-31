import { create } from 'zustand';

const useStore = create((set) => ({
  projects: [],
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
  refetchProjects: async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/projects/1`,
        {
          cache: 'no-store',
        },
      );
      const projects = await response.json();
      set({ projects, currentProject: projects[0] });
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // Handle the error
    }
  },
}));

export default useStore;
