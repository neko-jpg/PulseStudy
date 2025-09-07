import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    if ((mql as any).addEventListener) mql.addEventListener("change", onChange)
    else (mql as any).addListener?.(onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => {
      if ((mql as any).removeEventListener) mql.removeEventListener("change", onChange)
      else (mql as any).removeListener?.(onChange)
    }
  }, [])

  return !!isMobile
}
