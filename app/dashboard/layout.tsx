'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  FileText,
  Layers,
  LightbulbIcon,
  Settings,
  Users,
  PieChart,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Activity,
  FlaskConical,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-mobile'
import { useTheme } from 'next-themes'

interface SidebarNavItemProps {
  icon: React.ReactNode
  label: string
  href: string
  active: boolean
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Close the mobile menu when changing routes
    setIsMenuOpen(false)
  }, [pathname])

  const navItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: 'Data',
      href: '/dashboard/data',
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'BCG Matrix',
      href: '/dashboard/bcg-matrix',
    },
    {
      icon: <Activity className="h-5 w-5" />,
      label: 'Marketing',
      href: '/dashboard/marketing',
    },
    {
      icon: <LightbulbIcon className="h-5 w-5" />,
      label: 'Research',
      href: '/dashboard/research',
    },
    {
      icon: <FlaskConical className="h-5 w-5" />,
      label: 'Prototype',
      href: '/dashboard/prototype',
    },
    {
      icon: <Layers className="h-5 w-5" />,
      label: 'Strategies',
      href: '/dashboard/strategies',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      href: '/dashboard/settings',
    },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const NavItem = ({ icon, label, href, active }: SidebarNavItemProps) => {
    return (
      <Link 
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative group",
          active 
            ? "bg-primary/10 text-primary dark:bg-primary/20" 
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/70 dark:hover:text-slate-300"
        )}
      >
        <span className={cn(
          "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary opacity-0 transition-all",
          active && "opacity-100"
        )} />
        <span className={cn(
          "flex items-center justify-center transition-all duration-300",
          active ? "text-primary" : "text-slate-500 dark:text-slate-400 group-hover:text-primary dark:group-hover:text-primary"  
        )}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
        {active && (
          <ChevronRight className="ml-auto h-4 w-4 text-primary" />
        )}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900/90">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
          <Button
            variant="ghost" 
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>

          <div className="flex items-center gap-2">
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
            <span className="font-semibold text-gradient-primary">bizco.np</span>
          </div>
          
          {/* Theme toggle on mobile */}
          <div className="ml-auto">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar (Desktop) and Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-transform duration-300 md:translate-x-0 shadow-lg md:shadow-none",
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ width: '280px' }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-5 md:py-6">
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
            <span className="font-bold text-lg text-gradient-primary">bizco.np</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMenuOpen(false)}
            className="md:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="custom-scrollbar flex-1 overflow-auto px-4 py-6">
          <nav className="grid gap-1.5 mb-8">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                icon={item.icon}
                label={item.label}
                href={item.href}
                active={
                  item.href === '/dashboard' 
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href)
                }
              />
            ))}
          </nav>
          
          {/* Theme toggle in sidebar */}
          {mounted && (
            <div className="px-3 pt-2 pb-4 border-t border-slate-200/50 dark:border-slate-800/50 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 p-1.5 h-auto"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-200/50 dark:border-slate-800/50 p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn("flex-1 transition-all duration-300 md:ml-[280px]")}>
        {/* Backdrop for mobile sidebar */}
        {isMenuOpen && isMobile && (
          <div 
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Page Content */}
        <main className="min-h-screen animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  )
} 