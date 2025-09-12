"use client"

import { useEffect, useRef } from 'react'
import { useFocusStore } from '@/store/focusStore'

export function useFocusAdaptive(onLowFocus: () => void, opts?: { threshold?: number; streak?: number }) {
  const threshold = opts?.threshold ?? 0.35
  const streakNeed = opts?.streak ?? 3
  const streakRef = useRef(0)

  useEffect(() => {
    const unsub = (useFocusStore as any).subscribe(
      (s: any) => s.output.value,
      (v: number) => {
        if (v < threshold) {
          streakRef.current += 1
          if (streakRef.current >= streakNeed) {
            streakRef.current = 0
            onLowFocus()
          }
        } else {
          streakRef.current = 0
        }
      }
    )
    return () => { try { unsub() } catch {} }
  }, [onLowFocus, threshold, streakNeed])
}

