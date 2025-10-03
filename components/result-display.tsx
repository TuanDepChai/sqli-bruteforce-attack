"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, XCircle, AlertTriangle, Info, Shield, Lock, Zap, Target } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ResultDisplayProps {
  result: any
  className?: string
}

export function ResultDisplay({ result, className }: ResultDisplayProps) {
  if (!result) return null

  const isSuccess = result.success
  const isError = !result.success
  const hasVulnerability = result.vulnerability

  const getIcon = () => {
    if (hasVulnerability) return <Shield className="w-5 h-5" />
    if (isSuccess) return <CheckCircle className="w-5 h-5" />
    if (isError) return <XCircle className="w-5 h-5" />
    return <Info className="w-5 h-5" />
  }

  const getAlertVariant = () => {
    if (hasVulnerability) return "default"
    if (isSuccess) return "default"
    if (isError) return "destructive"
    return "default"
  }

  const getTextColor = () => {
    if (hasVulnerability) return "text-yellow-600"
    if (isSuccess) return "text-green-600"
    if (isError) return "text-red-600"
    return "text-blue-600"
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn("space-y-4", className)}
      >
        {/* Main Result Alert */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Alert className={cn(
            "border-2 shadow-lg backdrop-blur-sm",
            hasVulnerability && "border-yellow-400 bg-yellow-50/80",
            isSuccess && !hasVulnerability && "border-green-400 bg-green-50/80",
            isError && "border-red-400 bg-red-50/80"
          )}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            >
              {getIcon()}
            </motion.div>
            <AlertDescription className="space-y-2">
              <motion.p
                className={cn("font-semibold", getTextColor())}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {result.message}
              </motion.p>
              
              {hasVulnerability && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Zap className="w-3 h-3 mr-1" />
                    Security Alert
                  </Badge>
                  <p className="text-sm text-yellow-700 font-medium">
                    {result.vulnerability}
                  </p>
                </motion.div>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* User Information */}
        {result.user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
          >
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              User Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-300">ID:</span>
                <span className="text-white ml-2 font-mono">{result.user.id}</span>
              </div>
              <div>
                <span className="text-gray-300">Username:</span>
                <span className="text-white ml-2 font-mono">{result.user.username}</span>
              </div>
              <div>
                <span className="text-gray-300">Email:</span>
                <span className="text-white ml-2 font-mono">{result.user.email}</span>
              </div>
              <div>
                <span className="text-gray-300">Role:</span>
                <Badge variant="secondary" className="ml-2">
                  {result.user.role}
                </Badge>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Details */}
        {result.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-red-50/80 backdrop-blur-sm rounded-lg p-4 border border-red-200"
          >
            <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Error Details
            </h4>
            <p className="text-sm text-red-700 font-mono bg-red-100 p-2 rounded">
              {result.error}
            </p>
          </motion.div>
        )}

        {/* SQL Query */}
        {result.query && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200"
          >
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              SQL Query Executed
            </h4>
            <p className="text-sm text-gray-700 font-mono bg-gray-100 p-2 rounded overflow-x-auto">
              {result.query}
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export function AnimatedResultDisplay({ result }: { result: any }) {
  return (
    <motion.div
      layout
      className="w-full"
    >
      <ResultDisplay result={result} />
    </motion.div>
  )
}
