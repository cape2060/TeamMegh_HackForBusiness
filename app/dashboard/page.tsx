"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Factory, Settings, LogOut, Search, BarChart3, Lightbulb, Target, Megaphone, Upload, FileUp, Database, Eye, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { theme } = useTheme()
  // Notifications removed
  const [userName, setUserName] = useState("")
  const [companyName, setCompanyName] = useState("Your Company")
  const [isLoading, setIsLoading] = useState(true)
  const [uploadedData, setUploadedData] = useState<any[]>([])

  // Check authentication and fetch user data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token')
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        
        if (!token || !userData.id) {
          // If no token or user data, redirect to login
          router.push('/login')
          return
        }

        // Fetch user profile from API
        const profileResponse = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!profileResponse.ok) {
          // If API call fails, user might be unauthorized
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/login')
          return
        }

        const profileData = await profileResponse.json()
        setUserName(profileData.name || "User")

        // Fetch business data for company name
        try {
          const businessDataResponse = await fetch('http://localhost:5000/api/business-data/type/company_profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (businessDataResponse.ok) {
            const businessData = await businessDataResponse.json()
            if (businessData.length > 0 && businessData[0].data_content.companyName) {
              setCompanyName(businessData[0].data_content.companyName)
            }
          }
        } catch (error) {
          console.error("Error fetching company data:", error)
        }

        // Notifications removed
        
        // Load uploaded data from localStorage - only for current user
        const savedData = JSON.parse(localStorage.getItem('uploadedData') || '[]')
        const userSpecificData = savedData.filter((item: any) => item.userId === userData.id)
        setUploadedData(userSpecificData)
        
        setIsLoading(false)
      } catch (error) {
        console.error("Authentication error:", error)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      // In a real app with a backend logout endpoint:
      // const token = localStorage.getItem('token')
      // await fetch('http://localhost:5000/api/users/logout', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // })
      
      // Clear local storage
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      
      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const dashboardCards = [
    {
      title: "Data Management",
      description: "Upload, view and analyze your business data",
      icon: Database,
      href: "/dashboard/data",
      color: "bg-primary/10 text-primary",
      hoverEffect: "hover:bg-primary/15",
    },
    {
      title: "Start Research",
      description: "Begin collecting Secondary & Primary data",
      icon: Search,
      href: "/dashboard/research",
      color: "bg-indigo-500/10 text-indigo-500",
      hoverEffect: "hover:bg-indigo-500/15",
    },
    {
      title: "BCG Matrix Analysis",
      description: "Analyze product performance by market share vs growth",
      icon: BarChart3,
      href: "/dashboard/bcg-matrix",
      color: "bg-emerald-500/10 text-emerald-500",
      hoverEffect: "hover:bg-emerald-500/15",
    },
    {
      title: "Product Prototype",
      description: "Manage product ideas, test acceptability",
      icon: Lightbulb,
      href: "/dashboard/prototype",
      color: "bg-violet-500/10 text-violet-500",
      hoverEffect: "hover:bg-violet-500/15",
    },
    {
      title: "Niche Marketing",
      description: "Build personalized marketing plans for target groups",
      icon: Target,
      href: "/dashboard/marketing",
      color: "bg-amber-500/10 text-amber-500",
      hoverEffect: "hover:bg-amber-500/15",
    },
    {
      title: "Marketing Strategies",
      description: "Build campaign strategies based on customer behavior",
      icon: Megaphone,
      href: "/dashboard/strategies",
      color: "bg-pink-500/10 text-pink-500",
      hoverEffect: "hover:bg-pink-500/15",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-primary border-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center">
                Welcome, <span className="text-gradient-primary ml-2">{userName}</span>
                <span className="inline-block animate-float ml-2">👋</span>
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Choose a tool to start optimizing your business strategy
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm px-4 py-3 border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current Organization</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{companyName}</div>
              </div>
            </div>
          </div>
          
          <div className="h-1 w-24 bg-gradient-to-r from-primary to-indigo-500 rounded-full mb-6"></div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon
            return (
              <Link key={index} href={card.href} className="group block h-full">
                <Card variant="default" className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-slate-200/75 dark:border-slate-800/75">
                  <CardHeader className="pb-2">
                    <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 ${card.hoverEffect}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {card.description}
                    </CardDescription>
                    <div className="flex items-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Get started</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
        
        {/* Recent Activity Section */}
        {uploadedData.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
              Recent Activity
            </h3>
            <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200/75 dark:border-slate-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/80">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {uploadedData.slice(0, 5).map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {item.type || "Data"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-200">{item.name || "Untitled"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          {item.date ? formatDate(item.date) : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 px-2 py-1 h-auto">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
