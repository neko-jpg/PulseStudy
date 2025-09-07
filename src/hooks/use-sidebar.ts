import { create } from 'zustand';

type SidebarState = {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  setMobileOpen: (isOpen: boolean) => void;
};

export const useSidebar = create<SidebarState>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setMobileOpen: (isOpen) => set({ isMobileOpen: isOpen }),
}));
