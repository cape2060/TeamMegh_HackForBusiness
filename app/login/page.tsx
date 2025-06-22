"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Forgot password states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetError, setResetError] = useState("")
  const [resetSuccess, setResetSuccess] = useState("")
  const [isResetting, setIsResetting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }
      
      // Store user data and token
      localStorage.setItem('user', JSON.stringify({ 
        id: data.id,
        email: data.email, 
        name: data.name
      }))
      localStorage.setItem('token', data.token)
      
      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || 'An error occurred during login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle forgot password submit
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")
    setResetSuccess("")
    setIsResetting(true)
    
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError("Please enter a valid email address")
      setIsResetting(false)
      return
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed')
      }
      
      setResetSuccess("If an account exists with that email, password reset instructions have been sent.")
      
      // Clear the email field after successful submission
      setResetEmail("")
    } catch (err: any) {
      console.error("Password reset error:", err)
      // For security reasons, don't expose whether the account exists or not
      setResetSuccess("If an account exists with that email, password reset instructions have been sent.")
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 relative overflow-hidden">
              <Image 
                src="/logo/logo.png"
                alt="bizco.np Logo"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-2xl dark:text-white">Welcome Back</CardTitle>
          <CardDescription className="dark:text-gray-400">Sign in to your bizco.np account</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="dark:text-gray-300">Password</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="px-0 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                  onClick={() => setForgotPasswordOpen(true)}
                >
                  Forgot password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full dark:bg-purple-700 dark:hover:bg-purple-600" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm dark:text-gray-400">
            Don't have an account?{" "}
            <Link href="/register" className="text-purple-600 hover:underline dark:text-purple-400">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Reset Password</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Enter your email address and we'll send you instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          {resetError && (
            <Alert variant="destructive" className="mb-4 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{resetError}</AlertDescription>
            </Alert>
          )}
          
          {resetSuccess && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900">
              <AlertDescription>{resetSuccess}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail" className="dark:text-gray-300">Email</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="your@company.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <DialogFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setForgotPasswordOpen(false)}
                className="dark:bg-transparent dark:border-gray-600 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isResetting}
                className="dark:bg-purple-700 dark:hover:bg-purple-600"
              >
                {isResetting ? "Processing..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
