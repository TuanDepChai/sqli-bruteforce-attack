"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface InteractiveButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: "button" | "submit" | "reset"
}

export function InteractiveButton({
  children,
  onClick,
  variant = "default",
  size = "default",
  disabled = false,
  loading = false,
  className,
  type = "button",
  ...props
}: InteractiveButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        type={type}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        onClick={onClick}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          "hover:shadow-lg hover:shadow-blue-500/25",
          "active:shadow-md",
          disabled && "opacity-50 cursor-not-allowed",
          loading && "cursor-wait",
          className
        )}
        {...props}
      >
        {loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        
        <motion.div
          className="flex items-center space-x-2"
          animate={loading ? { opacity: [0.7, 1, 0.7] } : { opacity: 1 }}
          transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
        >
          {loading && (
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}
          <span>{children}</span>
        </motion.div>
      </Button>
    </motion.div>
  )
}

export function AnimatedSubmitButton({ children, loading, ...props }: InteractiveButtonProps) {
  return (
    <InteractiveButton
      {...props}
      loading={loading}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {children}
    </InteractiveButton>
  )
}
