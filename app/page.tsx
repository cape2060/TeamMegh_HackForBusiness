'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  FileText,
  LineChart,
  PieChart,
  LayoutDashboard,
  Target,
  Lightbulb,
} from 'lucide-react'
import { useTheme } from 'next-themes'

export default function Home() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Check if already logged in
  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900/90">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="logo-container">
                <div className="logo-pulse"></div>
                <div className="logo-inner">
                  <Image
                    src="/logo/logo.png"
                    alt="bizco.np Logo"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
              </div>
              <span className="font-bold text-xl text-gradient-primary">bizco.np</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <nav className="space-x-6">
                <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors">
                  How it works
                </Link>
                <Link href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-primary transition-colors">
                  Testimonials
                </Link>
              </nav>
              
              <div className="flex items-center gap-4">
                {/* Theme toggle */}
                {mounted && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                  >
                    {theme === 'dark' ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                      </svg>
                    )}
                  </Button>
                )}
                
                <Link href="/login">
                  <Button variant="outline" className="border-slate-200 dark:border-slate-700">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary/90">
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden">
              {mounted && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 mr-2"
                >
                  {theme === 'dark' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                  )}
                </Button>
              )}
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90">
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-24 sm:pb-20 md:pt-32 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 md:gap-8 items-center">
            <div className="text-center md:text-left max-w-2xl mx-auto md:mx-0">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="text-slate-900 dark:text-slate-100">Transform your business with </span>
                <span className="text-gradient-primary">data-driven</span>
                <span className="text-slate-900 dark:text-slate-100"> decisions</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Your all-in-one platform for market research, product portfolio analysis, 
                and strategic business planning. Get actionable insights to grow your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/register">
                  <Button className="btn-gradient-pill text-base h-12 px-8">
                    Get started for free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" className="border-slate-200 dark:border-slate-700 text-base h-12 px-8">
                    Explore features
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center md:justify-start space-x-6">
                <div className="flex -space-x-3">
                  <div className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700" />
                  <div className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-300 dark:bg-slate-600" />
                  <div className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-400 dark:bg-slate-500" />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-slate-200">500+</span> businesses trust bizco.np
                </div>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-primary/5 -z-10 rounded-3xl transform rotate-3"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-indigo-500/10 -z-10 rounded-3xl transform -rotate-2"></div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-4 transform transition-transform hover:scale-[1.02] duration-500">
                <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                  <Image 
                    src="/placeholder.jpg" 
                    alt="Dashboard Preview"
                    width={1200}
                    height={750}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Everything you need to grow your business</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Our comprehensive suite of tools helps you analyze your market, 
              assess your product portfolio, and develop winning strategies.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">BCG Matrix Analysis</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Analyze your product portfolio using the BCG matrix to identify stars, cash cows, question marks, and dogs.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-6">
                <FileText className="text-indigo-500 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Market Research</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Collect, analyze, and visualize both primary and secondary research data to understand your market.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-violet-500/10 rounded-lg flex items-center justify-center mb-6">
                <Target className="text-violet-500 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Niche Marketing</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Identify profitable niches and develop targeted marketing strategies for each customer segment.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-6">
                <Lightbulb className="text-emerald-500 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Product Prototyping</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Test product ideas and concepts with real users before investing in full development.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-6">
                <LineChart className="text-amber-500 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Data Visualization</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Transform complex data into clear, actionable visualizations that help you make informed decisions.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-6">
                <LayoutDashboard className="text-pink-500 h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Business Dashboard</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Get a comprehensive view of your business performance with customizable dashboards and reports.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-indigo-600 rounded-2xl p-8 md:p-12 shadow-xl text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-pattern-grid-md opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to transform your business?</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl">
                Join hundreds of businesses already using bizco.np to make data-driven decisions and grow their market share.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button className="bg-white text-primary hover:bg-white/90 text-base h-12 px-8">
                    Get started for free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 text-base h-12 px-8">
                    Log in to your account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between mb-8">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="logo-container">
                  <div className="logo-pulse"></div>
                  <div className="logo-inner">
                    <Image 
                      src="/logo/logo.png"
                      alt="bizco.np Logo"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                </div>
                <span className="font-bold text-xl text-gradient-primary">bizco.np</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 max-w-xs">
                Your partner in data-driven business growth through market research and strategic planning.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
              <div>
                <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-200">Product</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="#features" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                      Case studies
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-200">Company</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                      About us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-200">Legal</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">
                      Terms
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-8 text-center md:flex md:justify-between md:text-left">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              © {new Date().getFullYear()} bizco.np. All rights reserved.
            </p>
            <div className="flex justify-center mt-4 md:mt-0 space-x-6">
              <Link href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
              <Link href="#" className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
