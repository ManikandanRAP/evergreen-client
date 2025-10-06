"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 mobile-dialog-overlay data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    onTouchStart={(e) => {
      // Check if any popover is open
      const hasOpenPopover = document.querySelector('[data-state="open"]:not([data-radix-dialog-content]):not([data-radix-dialog-overlay])') ||
                            document.querySelector('[aria-expanded="true"]:not([data-radix-dialog-content]):not([data-radix-dialog-overlay])')
      
      // Only prevent if touching the overlay itself (not dialog content)
      const target = e.target as Element;
      const isOverlayTouch = target.classList.contains('mobile-dialog-overlay') || 
                            target.classList.contains('bg-black/80');
      
      if (hasOpenPopover && isOverlayTouch) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Prevent overlay from closing dialog on mobile when touching inside dialog content
      if (target.closest('[data-radix-dialog-content]') || 
          target.closest('[data-radix-popover-content]') || 
          target.closest('[data-radix-select-content]') ||
          target.closest('[data-radix-command]') ||
          target.closest('[data-radix-popover-trigger]') ||
          target.closest('[data-radix-select-trigger]')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }}
    onTouchEnd={(e) => {
      // Check if any popover is open
      const hasOpenPopover = document.querySelector('[data-state="open"]:not([data-radix-dialog-content]):not([data-radix-dialog-overlay])') ||
                            document.querySelector('[aria-expanded="true"]:not([data-radix-dialog-content]):not([data-radix-dialog-overlay])')
      
      // Only prevent if touching the overlay itself (not dialog content)
      const target = e.target as Element;
      const isOverlayTouch = target.classList.contains('mobile-dialog-overlay') || 
                            target.classList.contains('bg-black/80');
      
      if (hasOpenPopover && isOverlayTouch) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      
      // Prevent overlay from closing dialog on mobile when touching inside dialog content
      if (target.closest('[data-radix-dialog-content]') || 
          target.closest('[data-radix-popover-content]') || 
          target.closest('[data-radix-select-content]') ||
          target.closest('[data-radix-command]') ||
          target.closest('[data-radix-popover-trigger]') ||
          target.closest('[data-radix-select-trigger]')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }}
    onPointerDown={(e) => {
      // Prevent overlay from closing dialog when clicking inside dialog content
      const target = e.target as Element;
      if (target.closest('[data-radix-dialog-content]') || 
          target.closest('[data-radix-popover-content]') || 
          target.closest('[data-radix-select-content]') ||
          target.closest('[data-radix-command]') ||
          target.closest('[data-radix-popover-trigger]') ||
          target.closest('[data-radix-select-trigger]')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }}
    onMouseDown={(e) => {
      // Prevent overlay from closing dialog when clicking inside dialog content
      const target = e.target as Element;
      if (target.closest('[data-radix-dialog-content]') || 
          target.closest('[data-radix-popover-content]') || 
          target.closest('[data-radix-select-content]') ||
          target.closest('[data-radix-command]') ||
          target.closest('[data-radix-popover-trigger]') ||
          target.closest('[data-radix-select-trigger]')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideClose?: boolean }
>(({ className, children, hideClose = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      data-radix-dialog-content
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="navigation-button absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none border-2 border-slate-300 dark:border-slate-700 p-1.5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
