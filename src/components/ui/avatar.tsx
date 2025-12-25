"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, src, alt, ...props }, ref) => {
  // If src is a string and not empty, use next/image
  // Note: next/image requires width/height or fill. We use fill to match parent size.
  // We strictly override the primitive's rendering if we have a valid src to leverage optimization.
  // However, Radix Avatar handles fallback logic. To keep that working, we might need to stick to the primitive or
  // conditional rendering. A safe bet for full compatibility without reimplementing logic is:
  // 1. Keep using primitive for logic (loading status etc) but rendering is tricky.
  // 2. Simply use a standard img tag inside the primitive (default behavior) but formatted better.
  //
  // Actually, for simple avatars, standard img is often fine. But for large ones,
  // we can use:

  return (
    <AvatarPrimitive.Image
      ref={ref}
      src={src}
      alt={alt}
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
