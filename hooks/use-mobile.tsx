"use client"

import * as React from "react"
import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined") return
    
    const media = window.matchMedia(query)
    
    // Update the state with the current match
    const updateMatch = () => {
      setMatches(media.matches)
    }
    
    // Set initial value
    updateMatch()
    
    // Listen for changes
    if (typeof media.addEventListener === 'function') {
      media.addEventListener("change", updateMatch)
      return () => media.removeEventListener("change", updateMatch)
    } else {
      // Fallback for older browsers
      // @ts-ignore - Some older browsers use this API
      media.addListener(updateMatch)
      return () => {
        // @ts-ignore - Some older browsers use this API
        media.removeListener(updateMatch)
      }
    }
  }, [query])
  
  return matches
}
