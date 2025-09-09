"use client";

import { cn } from "@/lib/utils";

interface FocusNudgeProps {
  isActive: boolean;
  children: React.ReactNode;
}

/**
 * A wrapper component that applies a subtle "breathing" glow effect
 * to its children when active, serving as a gentle UI nudge to refocus.
 */
export const FocusNudge = ({ isActive, children }: FocusNudgeProps) => {
  return (
    <div
      className={cn(
        "transition-shadow duration-1000 ease-in-out rounded-lg",
        isActive && "focus-nudge-animation"
      )}
    >
      {children}
    </div>
  );
};
