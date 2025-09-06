import { create } from 'zustand';

type SidebarState = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
};

export const useSidebar = create<SidebarState>((set) => ({
  isCollapsed: false,
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));
