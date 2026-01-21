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
  const { className, children, minWidth = 400, minHeight = 300, defaultWidth = 672, defaultHeight = 600, ...otherProps } = props
  const contentRef = React.useRef<HTMLDivElement>(null)
  
  const [size, setSize] = React.useState({ 
    width: defaultWidth, 
    height: defaultHeight 
  })
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [resizeDirection, setResizeDirection] = React.useState<string>("")

  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
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
          newWidth = Math.max(minWidth, e.clientX - rect.left)
        }
        if (resizeDirection.includes("w")) {
          const deltaX = rect.right - e.clientX
          newWidth = Math.max(minWidth, deltaX)
        }
        if (resizeDirection.includes("s")) {
          newHeight = Math.max(minHeight, e.clientY - rect.top)
        }
        if (resizeDirection.includes("n")) {
          const deltaY = rect.bottom - e.clientY
          newHeight = Math.max(minHeight, deltaY)
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
          className
        )}
        style={{
          left: position.x !== 0 ? `${position.x}px` : '50%',
          top: position.y !== 0 ? `${position.y}px` : '50%',
          transform: position.x === 0 && position.y === 0 ? 'translate(-50%, -50%)' : 'none',
          width: `${size.width}px`,
          height: `${size.height}px`,
          maxWidth: "90vw",
          maxHeight: "90vh",
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
        
        <div className="relative w-full h-full overflow-auto" style={{ zIndex: 1 }}>
          {children}
        </div>

        {/* Resize handles */}
        {/* Top */}
        <div
          className="resize-handle absolute top-0 left-0 right-0 h-2 cursor-n-resize hover:bg-blue-500/20 transition-colors"
          style={{ zIndex: 9999 }}
          onMouseDown={(e) => handleMouseDown(e, "n")}
        />
        {/* Right */}
        <div
          className="resize-handle absolute top-0 right-0 bottom-0 w-2 cursor-e-resize hover:bg-blue-500/20 transition-colors"
          style={{ zIndex: 9999 }}
          onMouseDown={(e) => handleMouseDown(e, "e")}
        />
        {/* Bottom */}
        <div
          className="resize-handle absolute bottom-0 left-0 right-0 h-2 cursor-s-resize hover:bg-blue-500/20 transition-colors"
          style={{ zIndex: 9999 }}
          onMouseDown={(e) => handleMouseDown(e, "s")}
        />
        {/* Left */}
        <div
          className="resize-handle absolute top-0 left-0 bottom-0 w-2 cursor-w-resize hover:bg-blue-500/20 transition-colors"
          style={{ zIndex: 9999 }}
          onMouseDown={(e) => handleMouseDown(e, "w")}
        />
        {/* Corners */}
        <div
          className="resize-handle absolute top-0 left-0 w-4 h-4 cursor-nw-resize hover:bg-blue-500/30"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => handleMouseDown(e, "nw")}
        />
        <div
          className="resize-handle absolute top-0 right-0 w-4 h-4 cursor-ne-resize hover:bg-blue-500/30"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => handleMouseDown(e, "ne")}
        />
        <div
          className="resize-handle absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize hover:bg-blue-500/30"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => handleMouseDown(e, "sw")}
        />
        <div
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-blue-500/30"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => handleMouseDown(e, "se")}
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
