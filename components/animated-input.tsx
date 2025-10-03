"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Lock, User, AlertCircle, CheckCircle } from "lucide-react"

interface AnimatedInputProps {
  label: string
  type?: "text" | "password" | "email"
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  success?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}

export function AnimatedInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  success,
  disabled = false,
  icon,
  className
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHasValue(value.length > 0)
  }, [value])

  const isActive = isFocused || hasValue
  const inputType = type === "password" && showPassword ? "text" : type

  const getIcon = () => {
    if (icon) return icon
    if (type === "password") return <Lock className="w-5 h-5" />
    if (type === "email") return <User className="w-5 h-5" />
    return <User className="w-5 h-5" />
  }

  return (
    <div className={cn("relative", className)}>
      <motion.div
        className={cn(
          "relative rounded-lg border-2 transition-all duration-300",
          "bg-white/10 backdrop-blur-sm",
          isActive ? "border-blue-400 shadow-lg shadow-blue-400/20" : "border-gray-300/50",
          error && "border-red-400 shadow-red-400/20",
          success && "border-green-400 shadow-green-400/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        animate={{
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused 
            ? "0 0 20px rgba(59, 130, 246, 0.3)" 
            : "0 0 0px rgba(59, 130, 246, 0)"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Label */}
        <motion.label
          className={cn(
            "absolute left-4 transition-all duration-300 pointer-events-none",
            "text-gray-400",
            isActive && "text-blue-400",
            error && "text-red-400",
            success && "text-green-400"
          )}
          animate={{
            y: isActive ? -8 : 0,
            scale: isActive ? 0.85 : 1,
            x: isActive ? -2 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {label}
        </motion.label>

        {/* Input */}
        <div className="relative flex items-center">
          <div className="absolute left-4 text-gray-400">
            {getIcon()}
          </div>
          
          <input
            ref={inputRef}
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isActive ? placeholder : ""}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-4 pl-12 pr-12",
              "bg-transparent text-white placeholder-gray-400",
              "focus:outline-none",
              "transition-all duration-300"
            )}
          />

          {/* Password toggle */}
          {type === "password" && (
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </motion.button>
          )}

          {/* Status icons */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute right-4 text-red-400"
              >
                <AlertCircle className="w-5 h-5" />
              </motion.div>
            )}
            {success && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute right-4 text-green-400"
              >
                <CheckCircle className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-1 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FloatingLabelInput({ 
  label, 
  value, 
  onChange, 
  ...props 
}: AnimatedInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatedInput
        label={label}
        value={value}
        onChange={onChange}
        {...props}
      />
    </motion.div>
  )
}
