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
>(({ className, children, minWidth = 400, minHeight = 300, defaultWidth = 672, defaultHeight, ...props }, ref) => {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [size, setSize] = React.useState({ width: defaultWidth, height: defaultHeight || 0 })
  const [isResizing, setIsResizing] = React.useState(false)
  const [resizeDirection, setResizeDirection] = React.useState<string>("")

  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)
  }

  React.useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
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
      setResizeDirection("")
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, resizeDirection, minWidth, minHeight])

  return (
    <ResizableDialogPortal>
      <ResizableDialogOverlay />
      <DialogPrimitive.Content
        ref={contentRef}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          "relative overflow-hidden",
          className
        )}
        style={{
          width: `${size.width}px`,
          maxWidth: "90vw",
          maxHeight: "90vh",
          height: size.height > 0 ? `${size.height}px` : "auto",
        }}
        {...props}
      >
        <div className="overflow-y-auto max-h-full relative z-0">
          {children}
        </div>

        {/* Resize handles - larger hit areas for better usability */}
        {/* Top */}
        <div
          className="absolute top-0 left-0 right-0 h-3 cursor-n-resize hover:bg-blue-500/30 transition-colors z-[60] pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, "n")}
        />
        {/* Right */}
        <div
          className="absolute top-0 right-0 bottom-0 w-3 cursor-e-resize hover:bg-blue-500/30 transition-colors z-[60] pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, "e")}
        />
        {/* Bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-3 cursor-s-resize hover:bg-blue-500/30 transition-colors z-[60] pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, "s")}
        />
        {/* Left */}
        <div
          className="absolute top-0 left-0 bottom-0 w-3 cursor-w-resize hover:bg-blue-500/30 transition-colors z-[60] pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, "w")}
        />
        {/* Top-left corner */}
        <div
          className="absolute top-0 left-0 w-5 h-5 cursor-nw-resize hover:bg-blue-500/30 transition-colors z-[70] pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, "nw")}
        />
        {/* Top-right corner */}
        <div
          className="absolute top-0 right-0 w-5 h-5 cursor-ne-resize hover:bg-blue-500/30 transition-colors z-[70] pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, "ne")}
        />
        {/* Bottom-left corner */}
        <div
          className="absolute bottom-0 left-0 w-5 h-5 cursor-sw-resize hover:bg-blue-500/30 transition-colors z-[70] pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, "sw")}
        />
        {/* Bottom-right corner */}
        <div
          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize hover:bg-blue-500/30 transition-colors z-[70] pointer-events-auto"
          onMouseDown={(e) => handleMouseDown(e, "se")}
        />
        
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-[80]">
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
