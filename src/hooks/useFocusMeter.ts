import { useContext } from 'react';
import { useFocusStore } from '@/store/focusStore';
import { FocusMeterContext } from '@/components/providers/FocusMeterProvider';

/**
 * Hook to access the focus meter state and controls.
 *
 * This is the primary hook for components to interact with the focus measurement system.
 * It provides the latest focus output data from the Zustand store and control functions
 * (start, stop, setMode) from the FocusMeterProvider context.
 *
 * @returns An object containing the current `output` and control functions.
 * @throws An error if used outside of a `FocusMeterProvider`.
 */
export const useFocusMeter = () => {
  const output = useFocusStore((state) => state.output);
  const controls = useContext(FocusMeterContext);

  if (controls === undefined) {
    throw new Error('useFocusMeter must be used within a FocusMeterProvider');
  }

  return { output, ...controls };
};
