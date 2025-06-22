"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Target, Upload, FileText, ChevronRight, BarChart, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function MarketingPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Call the niche market analysis API
      const response = await fetch('http://localhost:8002/analyze_niche_market', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setAnalysisResults(data)
      
      toast({
        title: "Analysis completed",
        description: "Niche market analysis has been completed successfully",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description: "There was an error analyzing the file",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Niche Marketing</h1>
            <p className="text-gray-600 dark:text-gray-400">Discover profitable niche markets for your business</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Niche Market Analysis Upload */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Niche Market Analysis
            </CardTitle>
            <CardDescription>Upload your market data to discover profitable niche segments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                />
                
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="rounded-full bg-orange-100 dark:bg-orange-900/30 p-3">
                    <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Upload Market Data</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Upload CSV or Excel files with your market data
                    </p>
                  </div>
                  
                  {selectedFile ? (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-md px-4 py-2 w-full max-w-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <span className="text-sm truncate">{selectedFile.name}</span>
                      </div>
                    </div>
                  ) : null}
                  
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select File
                    </Button>
                    
                    <Button 
                      onClick={handleFileUpload}
                      disabled={!selectedFile || isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <BarChart className="h-4 w-4 mr-2" />
                          Analyze Niche Markets
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Analysis Results */}
              {analysisResults && (
                <div className="mt-8 space-y-6">
                  <h3 className="text-xl font-semibold">Analysis Results</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Top Niche Markets</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisResults.topNiches?.map((niche: string, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                {index + 1}
                              </Badge>
                              <span>{niche}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Market Potential</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisResults.marketPotential?.map((item: any, index: number) => (
                            <li key={index} className="flex items-center justify-between">
                              <span>{item.niche}</span>
                              <Badge variant={index < 3 ? "default" : "outline"}>
                                {item.potential}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysisResults.recommendations?.map((rec: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <ChevronRight className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {analysisResults.graphUrl && (
                    <div className="mt-6">
                      <h4 className="text-lg font-medium mb-3">Market Visualization</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <img 
                          src={analysisResults.graphUrl} 
                          alt="Market Analysis Graph" 
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
