import { create } from 'zustand';

const useStore = create((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  currentProject: {},
  setCurrentProject: (currentProject) => set({ currentProject }),
}));

export default useStore;
