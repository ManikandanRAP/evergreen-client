"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedNavIndicatorProps {
  activeIndex: number
  totalItems: number
  className?: string
  pathname: string
}

export default function AnimatedNavIndicator({ 
  activeIndex, 
  totalItems, 
  className,
  pathname
}: AnimatedNavIndicatorProps) {
  const indicatorRef = useRef<HTMLDivElement>(null)
  const isAnimatingRef = useRef(false)
  const previousActiveIndexRef = useRef(-1)
  const isInitialLoadRef = useRef(true)
  const previousPositionRef = useRef<{left: number, width: number} | null>(null)
  const previousPathnameRef = useRef(pathname)

  useEffect(() => {
    const updateIndicator = () => {
      if (indicatorRef.current) {
        const container = indicatorRef.current.parentElement
        if (!container) return

        // Get the navigation items to calculate exact positions
        const navItems = container.querySelectorAll('[data-nav-item]')
        if (navItems.length === 0) return

        const activeItem = navItems[activeIndex] as HTMLElement
        if (!activeItem) return

        // Get the exact position and size of the active item
        const containerRect = container.getBoundingClientRect()
        const itemRect = activeItem.getBoundingClientRect()
        
        const left = itemRect.left - containerRect.left
        const width = itemRect.width
        
        // Animate immediately when activeIndex changes (on click)
        const shouldAnimate = previousActiveIndexRef.current !== -1 && 
                             previousActiveIndexRef.current !== activeIndex && 
                             !isInitialLoadRef.current && 
                             previousPositionRef.current
        
        if (shouldAnimate && previousPositionRef.current) {
          // Cancel any ongoing animation
          if (isAnimatingRef.current) {
            indicatorRef.current.style.transition = 'none'
          }
          
          // Mark as animating
          isAnimatingRef.current = true
          
          // Set to previous position without animation
          indicatorRef.current.style.left = `${previousPositionRef.current.left}px`
          indicatorRef.current.style.width = `${previousPositionRef.current.width}px`
          indicatorRef.current.style.opacity = '1'
          
          // Force a reflow
          indicatorRef.current.offsetHeight
          
          // Animate to new position
          indicatorRef.current.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          indicatorRef.current.style.left = `${left}px`
          indicatorRef.current.style.width = `${width}px`
          
          // Reset animation flag
          setTimeout(() => {
            isAnimatingRef.current = false
          }, 400)
          
        } else {
          // Set position immediately without animation
          indicatorRef.current.style.transition = 'none'
          indicatorRef.current.style.left = `${left}px`
          indicatorRef.current.style.width = `${width}px`
          indicatorRef.current.style.opacity = '1'
        }
        
        // Always update refs
        previousActiveIndexRef.current = activeIndex
        previousPathnameRef.current = pathname
        isInitialLoadRef.current = false
        previousPositionRef.current = { left, width }
      }
    }

    // Update immediately
    updateIndicator()
  }, [activeIndex, pathname])

  return (
    <div
      ref={indicatorRef}
      className={cn(
        "absolute top-1 bottom-1",
        "bg-emerald-500",
        "rounded-full shadow-lg",
        "transform-gpu",
        "opacity-0", // Start hidden
        className
      )}
      style={{
        transformOrigin: "center center",
        willChange: "left, width, opacity",
      }}
    />
  )
}
