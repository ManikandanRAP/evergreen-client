"use client"

import { useState, useEffect } from 'react'

export function usePopoverState() {
  const [hasOpenPopover, setHasOpenPopover] = useState(false)

  useEffect(() => {
    const checkPopoverState = () => {
      // Check for various Radix UI open states
      const popoverOpen = document.querySelector('[data-radix-popover-content][data-state="open"]') ||
                         document.querySelector('[data-radix-popover-content][data-open="true"]')
      const selectOpen = document.querySelector('[data-radix-select-content][data-state="open"]') ||
                        document.querySelector('[data-radix-select-content][data-open="true"]')
      const commandOpen = document.querySelector('[data-radix-command][data-state="open"]') ||
                         document.querySelector('[data-radix-command][data-open="true"]')
      const comboboxOpen = document.querySelector('[data-radix-combobox-content][data-state="open"]') ||
                          document.querySelector('[data-radix-combobox-content][data-open="true"]')
      
      // Also check for any element with data-state="open" that might be a popover
      const anyOpenPopover = document.querySelector('[data-state="open"]:not([data-radix-dialog-content]):not([data-radix-dialog-overlay])')
      
      // Check for elements with aria-expanded="true" (common for dropdowns)
      const ariaExpanded = document.querySelector('[aria-expanded="true"]:not([data-radix-dialog-content]):not([data-radix-dialog-overlay])')
      
      const hasOpen = popoverOpen || selectOpen || commandOpen || comboboxOpen || anyOpenPopover || ariaExpanded
      
      console.log('[MOBILE DEBUG] Popover state check:', {
        popoverOpen: !!popoverOpen,
        selectOpen: !!selectOpen,
        commandOpen: !!commandOpen,
        comboboxOpen: !!comboboxOpen,
        anyOpenPopover: !!anyOpenPopover,
        ariaExpanded: !!ariaExpanded,
        hasOpen: !!hasOpen,
        allOpenElements: document.querySelectorAll('[data-state="open"]').length,
        allAriaExpanded: document.querySelectorAll('[aria-expanded="true"]').length
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
