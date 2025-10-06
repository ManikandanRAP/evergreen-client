"use client"

import { useState, useEffect } from 'react'

export function usePopoverState() {
  const [hasOpenPopover, setHasOpenPopover] = useState(false)

  useEffect(() => {
    const checkPopoverState = () => {
      const popoverOpen = document.querySelector('[data-radix-popover-content][data-state="open"]')
      const selectOpen = document.querySelector('[data-radix-select-content][data-state="open"]')
      const commandOpen = document.querySelector('[data-radix-command][data-state="open"]')
      const comboboxOpen = document.querySelector('[data-radix-combobox-content][data-state="open"]')
      
      const hasOpen = popoverOpen || selectOpen || commandOpen || comboboxOpen
      
      console.log('[MOBILE DEBUG] Popover state check:', {
        popoverOpen: !!popoverOpen,
        selectOpen: !!selectOpen,
        commandOpen: !!commandOpen,
        comboboxOpen: !!comboboxOpen,
        hasOpen: !!hasOpen
      })
      
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
