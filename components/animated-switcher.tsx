"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedSwitcherProps {
  activeIndex: number
  onIndexChange: (index: number) => void
  options: { value: string; label: string; icon?: React.ComponentType<{ className?: string }> }[]
  className?: string
}

export default function AnimatedSwitcher({ 
  activeIndex, 
  onIndexChange, 
  options,
  className 
}: AnimatedSwitcherProps) {
  const indicatorRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updateIndicator = () => {
      if (indicatorRef.current && containerRef.current) {
        const navItems = containerRef.current.children
        const activeItem = navItems[activeIndex] as HTMLElement
        
        if (activeItem) {
          const containerRect = containerRef.current.getBoundingClientRect()
          const itemRect = activeItem.getBoundingClientRect()
          
          // Calculate position and width to cover the full element including padding
          const left = itemRect.left - containerRect.left
          const width = itemRect.width
          
          // Set the background to cover the full element
          indicatorRef.current.style.left = `${left}px`
          indicatorRef.current.style.width = `${width}px`
          indicatorRef.current.style.opacity = '1'
          indicatorRef.current.style.position = 'absolute'
          indicatorRef.current.style.top = '4px'
          indicatorRef.current.style.bottom = '4px'
          
          // Set the background color based on the active index
          if (activeIndex === 0) {
            indicatorRef.current.style.backgroundColor = 'rgb(34 197 94)' // emerald-500 - more vibrant green
            indicatorRef.current.style.borderColor = 'rgb(16 185 129)' // emerald-500
            indicatorRef.current.style.borderWidth = '2px'
            indicatorRef.current.style.borderStyle = 'solid'
          } else {
            indicatorRef.current.style.backgroundColor = 'rgb(6 182 212)' // cyan-500 - more vibrant cyan
            indicatorRef.current.style.borderColor = 'rgb(8 145 178)' // cyan-600
            indicatorRef.current.style.borderWidth = '2px'
            indicatorRef.current.style.borderStyle = 'solid'
          }
          
          // Force a reflow to ensure the positioning is applied
          indicatorRef.current.offsetHeight
        }
      }
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateIndicator, 10)
    
    return () => clearTimeout(timeoutId)
  }, [activeIndex])

  return (
    <div className={cn("relative", className)}>
      {/* Animated background indicator */}
      <div
        ref={indicatorRef}
        className="absolute inset-y-[4px] rounded-lg transition-all duration-300 ease-out opacity-0 z-10 bg-emerald-500"
        style={{
          willChange: 'left, width, opacity'
        }}
      />
      
      {/* Switcher container */}
      <div 
        ref={containerRef}
        className="relative flex items-center border rounded-lg p-1 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-950/20 dark:to-cyan-950/20 border-emerald-200 dark:border-emerald-800 overflow-hidden"
      >
        {options.map((option, index) => {
          const isActive = activeIndex === index
          const Icon = option.icon
          
          return (
            <button
              key={option.value}
              onClick={() => onIndexChange(index)}
              className={cn(
                "relative flex items-center justify-center h-8 px-3 rounded-lg transition-all duration-200 ease-out z-20",
                isActive 
                  ? "text-white font-semibold" 
                  : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
              )}
            >
              {Icon && (
                <Icon className="h-4 w-4" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
