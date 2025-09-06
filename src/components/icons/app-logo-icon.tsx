import type { SVGProps } from "react";

export function AppLogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="50" cy="50" r="45" fill="hsl(var(--primary))" opacity="0.2" />
      <path d="M30,40 L50,20 L70,40 L65,60 L35,60 Z" fill="hsl(var(--primary))" />
      <circle cx="50" cy="35" r="5" fill="hsl(var(--card))" />
    </svg>
  );
}
