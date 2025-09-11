import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ConsentStatus = 'prompt' | 'granted' | 'denied';

interface PrivacyState {
  cameraConsent: ConsentStatus;
  setCameraConsent: (status: ConsentStatus) => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      cameraConsent: 'prompt', // Default state, user needs to be prompted
      setCameraConsent: (status: ConsentStatus) => set({ cameraConsent: status }),
    }),
    {
      name: 'privacy-settings-storage', // Name for the localStorage item
      storage: createJSONStorage(() => localStorage), // Use localStorage for persistence
    }
  )
);
