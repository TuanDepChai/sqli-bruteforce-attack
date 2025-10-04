"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Monitor, Palette } from "lucide-react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system"
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="w-10 h-10 p-0">
        <div className="w-4 h-4" />
      </Button>
    )
  }

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" }
  ] as const

  const currentTheme = themes.find(t => t.value === theme)

  return (
    <div className="relative">
      <motion.div
        className="flex items-center gap-1 p-1 rounded-lg bg-background border"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isActive = theme === themeOption.value
          
          return (
            <motion.div key={themeOption.value}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className="w-8 h-8 p-0 relative"
                onClick={() => setTheme(themeOption.value as any)}
              >
                <motion.div
                  animate={{ 
                    rotate: isActive ? [0, 360] : 0,
                    scale: isActive ? 1.1 : 1
                  }}
                  transition={{ 
                    duration: isActive ? 0.6 : 0.2,
                    ease: "easeOut"
                  }}
                >
                  <Icon className="w-4 h-4" />
                </motion.div>
                
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-md bg-primary/20"
                    layoutId="activeTheme"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
              </Button>
            </motion.div>
          )
        })}
      </motion.div>
      
      {/* Theme indicator */}
      <motion.div
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {currentTheme?.label}
      </motion.div>
    </div>
  )
}

// Advanced Color Palette Selector
export function ColorPaletteSelector() {
  const [selectedPalette, setSelectedPalette] = useState("default")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("colorPalette")
    if (saved) setSelectedPalette(saved)
  }, [])

  const palettes = [
    {
      name: "default",
      label: "Default",
      colors: {
        primary: "hsl(221.2 83.2% 53.3%)",
        secondary: "hsl(210 40% 98%)",
        accent: "hsl(210 40% 96%)",
        destructive: "hsl(0 84.2% 60.2%)"
      }
    },
    {
      name: "purple",
      label: "Purple",
      colors: {
        primary: "hsl(262.1 83.3% 57.8%)",
        secondary: "hsl(263.4 70% 98%)",
        accent: "hsl(263.4 70% 96%)",
        destructive: "hsl(0 84.2% 60.2%)"
      }
    },
    {
      name: "green",
      label: "Green",
      colors: {
        primary: "hsl(142.1 76.2% 36.3%)",
        secondary: "hsl(143.4 70% 98%)",
        accent: "hsl(143.4 70% 96%)",
        destructive: "hsl(0 84.2% 60.2%)"
      }
    },
    {
      name: "orange",
      label: "Orange",
      colors: {
        primary: "hsl(24.6 95% 53.1%)",
        secondary: "hsl(24.6 95% 98%)",
        accent: "hsl(24.6 95% 96%)",
        destructive: "hsl(0 84.2% 60.2%)"
      }
    }
  ]

  const applyPalette = (palette: typeof palettes[0]) => {
    const root = document.documentElement
    Object.entries(palette.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
    setSelectedPalette(palette.name)
    localStorage.setItem("colorPalette", palette.name)
  }

  if (!mounted) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">Color Palette</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {palettes.map((palette) => (
          <motion.button
            key={palette.name}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedPalette === palette.name 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => applyPalette(palette)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="space-y-2">
              <div className="flex gap-1">
                {Object.values(palette.colors).map((color, index) => (
                  <motion.div
                    key={index}
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
              </div>
              <div className="text-xs font-medium">{palette.label}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// Advanced Settings Panel
export function AdvancedSettings() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <motion.button
        className="p-2 rounded-lg bg-background border hover:bg-accent transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Palette className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-12 right-0 w-80 p-4 bg-background border rounded-lg shadow-lg z-50"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Theme Settings</h3>
                <ThemeToggle />
              </div>
              
              <div>
                <ColorPaletteSelector />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
