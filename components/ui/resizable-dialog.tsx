"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ResizableDialog = DialogPrimitive.Root
const ResizableDialogTrigger = DialogPrimitive.Trigger
const ResizableDialogPortal = DialogPrimitive.Portal
const ResizableDialogClose = DialogPrimitive.Close

const ResizableDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
ResizableDialogOverlay.displayName = "ResizableDialogOverlay"

interface ResizableDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  minWidth?: number
  minHeight?: number
  defaultWidth?: number
  defaultHeight?: number
}

const ResizableDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ResizableDialogContentProps
>((props, ref) => {
  const { className, children, minWidth = 400, minHeight = 300, defaultWidth = 672, defaultHeight, ...otherProps } = props
  const contentRef = React.useRef<HTMLDivElement>(null)
  
  // Constrain initial size to viewport - ensure it ALWAYS fits on screen
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768
  
  const constrainedWidth = Math.min(defaultWidth, viewportWidth * 0.9)
  const constrainedHeight = defaultHeight ? Math.min(defaultHeight, viewportHeight * 0.85) : 0
  
  const [size, setSize] = React.useState({ width: constrainedWidth, height: constrainedHeight })
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [resizeDirection, setResizeDirection] = React.useState<string>("")

  console.log('🔵 ResizableDialog - viewport:', viewportWidth, 'x', viewportHeight, 'requested:', defaultWidth, 'x', defaultHeight, 'constrained to:', constrainedWidth, 'x', constrainedHeight)

  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    console.log('🔵 Resize handle clicked:', direction)
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
  }

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  React.useEffect(() => {
    if (!isResizing && !isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x
        const newY = e.clientY - dragStart.y
        setPosition({ x: newX, y: newY })
        return
      }

      if (!contentRef.current) return

      const rect = contentRef.current.getBoundingClientRect()
      
      setSize((prevSize) => {
        let newWidth = prevSize.width
        let newHeight = prevSize.height

        if (resizeDirection.includes("e")) {
          const centerX = window.innerWidth / 2
          const deltaX = e.clientX - centerX
          newWidth = Math.max(minWidth, deltaX * 2)
        }
        if (resizeDirection.includes("w")) {
          const centerX = window.innerWidth / 2
          const deltaX = centerX - e.clientX
          newWidth = Math.max(minWidth, deltaX * 2)
        }
        if (resizeDirection.includes("s")) {
          const centerY = window.innerHeight / 2
          const deltaY = e.clientY - centerY
          newHeight = Math.max(minHeight, deltaY * 2)
        }
        if (resizeDirection.includes("n")) {
          const centerY = window.innerHeight / 2
          const deltaY = centerY - e.clientY
          newHeight = Math.max(minHeight, deltaY * 2)
        }

        return { width: newWidth, height: newHeight }
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setIsDragging(false)
      setResizeDirection("")
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, isDragging, dragStart, position, resizeDirection, minWidth, minHeight])

  return (
    <ResizableDialogPortal>
      <ResizableDialogOverlay />
      <DialogPrimitive.Content
        ref={contentRef}
        className={cn(
          "fixed z-50 border bg-background shadow-lg sm:rounded-lg",
          "relative",
          className
        )}
        style={{
          left: position.x !== 0 ? `${position.x}px` : '50%',
          top: position.y !== 0 ? `${position.y}px` : '5vh',
          transform: position.x === 0 && position.y === 0 ? 'translateX(-50%)' : 'none',
          width: Math.min(size.width, viewportWidth * 0.9) + 'px',
          maxWidth: "90vw",
          maxHeight: "85vh",
          height: size.height > 0 ? Math.min(size.height, viewportHeight * 0.85) + 'px' : "auto",
          overflow: "hidden",
          cursor: isDragging ? 'move' : 'default'
        }}
        {...otherProps}
      >
        {/* Draggable header area */}
        <div 
          className="absolute top-0 left-0 right-0 h-12 cursor-move z-[60]" 
          onMouseDown={handleDragStart}
          title="Drag to move"
        />
        
        <div className="relative w-full h-full" style={{ zIndex: 1 }}>
          {children}
        </div>

        {/* Resize handles - highly visible and easy to grab */}
        {/* Top */}
        <div
          className="absolute top-0 left-0 right-0 h-1 cursor-n-resize bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors"
          style={{ zIndex: 9999, pointerEvents: 'auto' }}
          onMouseDown={(e) => handleMouseDown(e, "n")}
          title="Drag to resize vertically"
        />
        {/* Right */}
        <div
          className="absolute top-0 right-0 bottom-0 w-1 cursor-e-resize bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors"
          style={{ zIndex: 9999, pointerEvents: 'auto' }}
          onMouseDown={(e) => handleMouseDown(e, "e")}
          title="Drag to resize horizontally"
        />
        {/* Bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1 cursor-s-resize bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors"
          style={{ zIndex: 9999, pointerEvents: 'auto' }}
          onMouseDown={(e) => handleMouseDown(e, "s")}
          title="Drag to resize vertically"
        />
        {/* Left */}
        <div
          className="absolute top-0 left-0 bottom-0 w-1 cursor-w-resize bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors"
          style={{ zIndex: 9999, pointerEvents: 'auto' }}
          onMouseDown={(e) => handleMouseDown(e, "w")}
          title="Drag to resize horizontally"
        />
        {/* Top-left corner */}
        <div
          className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors"
          style={{ zIndex: 10000, pointerEvents: 'auto' }}
          onMouseDown={(e) => handleMouseDown(e, "nw")}
          title="Drag to resize diagonally"
        />
        {/* Top-right corner */}
        <div
          className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors"
          style={{ zIndex: 10000, pointerEvents: 'auto' }}
          onMouseDown={(e) => handleMouseDown(e, "ne")}
          title="Drag to resize diagonally"
        />
        {/* Bottom-left corner */}
        <div
          className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors"
          style={{ zIndex: 10000, pointerEvents: 'auto' }}
          onMouseDown={(e) => handleMouseDown(e, "sw")}
          title="Drag to resize diagonally"
        />
        {/* Bottom-right corner */}
        <div
          className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors"
          style={{ zIndex: 10000, pointerEvents: 'auto' }}
          onMouseDown={(e) => handleMouseDown(e, "se")}
          title="Drag to resize diagonally"
        />
        
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" style={{ zIndex: 102 }}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </ResizableDialogPortal>
  )
})
ResizableDialogContent.displayName = "ResizableDialogContent"

const ResizableDialogHeader = ({
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
ResizableDialogHeader.displayName = "ResizableDialogHeader"

const ResizableDialogFooter = ({
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
ResizableDialogFooter.displayName = "ResizableDialogFooter"

const ResizableDialogTitle = React.forwardRef<
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
ResizableDialogTitle.displayName = "ResizableDialogTitle"

const ResizableDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
ResizableDialogDescription.displayName = "ResizableDialogDescription"

export {
  ResizableDialog,
  ResizableDialogPortal,
  ResizableDialogOverlay,
  ResizableDialogTrigger,
  ResizableDialogClose,
  ResizableDialogContent,
  ResizableDialogHeader,
  ResizableDialogFooter,
  ResizableDialogTitle,
  ResizableDialogDescription,
}
