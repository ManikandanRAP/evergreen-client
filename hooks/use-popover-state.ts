"use client"

import { useState, useEffect } from 'react'

export function usePopoverState() {
  const [hasOpenPopover, setHasOpenPopover] = useState(false)

  useEffect(() => {
    const checkPopoverState = () => {
      const hasOpen = document.querySelector('[data-radix-popover-content][data-state="open"]') ||
                     document.querySelector('[data-radix-select-content][data-state="open"]') ||
                     document.querySelector('[data-radix-command][data-state="open"]') ||
                     document.querySelector('[data-radix-combobox-content][data-state="open"]')
      
      setHasOpenPopover(!!hasOpen)
    }

    // Check initially
    checkPopoverState()

    // Set up mutation observer to watch for changes
    const observer = new MutationObserver(checkPopoverState)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-state']
    })

    // Also listen for focus events which might indicate popover state changes
    document.addEventListener('focusin', checkPopoverState)
    document.addEventListener('focusout', checkPopoverState)

    return () => {
      observer.disconnect()
      document.removeEventListener('focusin', checkPopoverState)
      document.removeEventListener('focusout', checkPopoverState)
    }
  }, [])

  return hasOpenPopover
}
