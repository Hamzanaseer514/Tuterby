import * as React from "react"
import { cn } from "@/lib/utils"

function Badge({
  className,
  variant = "default",
  ...props
}) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors"
  
  const variantClasses = {
    default: "border-transparent bg-blue-100 text-blue-800",
    secondary: "border-transparent bg-gray-100 text-gray-800",
    destructive: "border-transparent bg-red-100 text-red-800",
    outline: "border-gray-300 text-gray-700"
  }
  
  return (
    <div 
      className={cn(baseClasses, variantClasses[variant], className)} 
      {...props} 
    />
  )
}

export { Badge } 