"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ArrowLeft, BarChart3, FileText, Loader2, Import } from "lucide-react"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

export default function ResearchPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [quantFile, setQuantFile] = useState<File | null>(null)
  const [quantFileDescription, setQuantFileDescription] = useState('')
  const [primaryFile, setPrimaryFile] = useState<File | null>(null)
  const [primaryFileDescription, setPrimaryFileDescription] = useState('')
  const [isAnalyzingSecondary, setIsAnalyzingSecondary] = useState(false)
  const [isAnalyzingPrimary, setIsAnalyzingPrimary] = useState(false)
  const [secondaryResults, setSecondaryResults] = useState<any>(null)
  const [primaryResults, setPrimaryResults] = useState<any>(null)
  const { toast } = useToast()

  // Define server URLs
  const NODE_SERVER_URL = "http://localhost:5000"
  const FASTAPI_SERVER_URL = "http://localhost:8000"
  const FASTAPI_SECONDARY_URL = "http://localhost:8001"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'secondary' | 'primary') => {
    if (e.target.files && e.target.files[0]) {
      if (fileType === 'secondary') {
        setQuantFile(e.target.files[0])
      } else {
        setPrimaryFile(e.target.files[0])
      }
    }
  }
  
  // Function to analyze secondary research data
  const analyzeSecondaryData = async () => {
    try {
      if (!quantFile) {
        toast({
          title: "Missing File",
          description: "Please upload a quantitative data file first.",
          variant: "destructive",
        })
        return
      }
      
      setIsAnalyzingSecondary(true)
      
      // Create form data to send file
      const formData = new FormData()
      formData.append('file', quantFile)
      formData.append('description', quantFileDescription)
      
      // Get token from localStorage (for future authorization if needed)
      const token = localStorage.getItem('token')
      
      console.log('Sending request to FastAPI secondary research endpoint')
      
      // Call the FastAPI endpoint for secondary research analysis (no token required for FastAPI)
      const response = await axios.post(`${FASTAPI_SECONDARY_URL}/analyze_secondary`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout
      })
      
      console.log('Received secondary response from FastAPI:', response.data)
      
      if (response.data && response.data.success) {
        console.log('Secondary analysis results:', response.data)
        setSecondaryResults(response.data)
        setCurrentStep(2)
        toast({
          title: "Secondary Analysis Complete",
          description: "Quantitative data analysis has been generated successfully.",
          variant: "default",
        })
      } else {
        console.error('Secondary analysis error:', response.data)
        toast({
          title: "Secondary Analysis Error",
          description: "An error occurred during analysis. Please check the console for details.",
          variant: "destructive",
        })
      }
    } catch (axiosError: any) {
      console.error('Network or server error:', axiosError)
      
      let errorMessage = "Failed to connect to the FastAPI server. Please make sure it's running on port 8001."
      
      if (axiosError.response) {
        errorMessage = `FastAPI server error: ${axiosError.response.data.detail || axiosError.response.statusText}`
      } else if (axiosError.request) {
        errorMessage = "No response received from server. Please check that the FastAPI server is running."
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzingSecondary(false)
    }
  }
  
  // Function to analyze primary research data
  const analyzePrimaryData = async () => {
    try {
      if (!primaryFile) {
        toast({
          title: "Missing File",
          description: "Please upload a qualitative data file first.",
          variant: "destructive",
        })
        return
      }
      
      setIsAnalyzingPrimary(true)
      
      // Create form data to send file
      const formData = new FormData()
      formData.append('file', primaryFile)
      formData.append('description', primaryFileDescription)
      
      // Get token from localStorage (for future authorization if needed)
      const token = localStorage.getItem('token')
      
      console.log('Sending request to FastAPI primary analysis endpoint')
      
      // Call the FastAPI endpoint for primary research analysis (no token required for FastAPI)
      const response = await axios.post('http://localhost:8000/analyze_primary', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes timeout
      })
      
      console.log('Received primary response from FastAPI:', response.data)
      
      if (response.data && response.data.success) {
        console.log('Primary analysis results:', response.data)
        setPrimaryResults(response.data)
        setCurrentStep(2)
        toast({
          title: "Primary Analysis Complete",
          description: "Qualitative data analysis has been generated successfully.",
          variant: "default",
        })
      } else {
        console.error('Primary analysis error:', response.data)
        toast({
          title: "Primary Analysis Error",
          description: "An error occurred during analysis. Please check the console for details.",
          variant: "destructive",
        })
      }
    } catch (axiosError: any) {
      console.error('Network or server error:', axiosError)
      
      let errorMessage = "Failed to connect to the FastAPI server. Please make sure it's running on port 8000."
      
      if (axiosError.response) {
        errorMessage = `FastAPI server error: ${axiosError.response.data.detail || axiosError.response.statusText}`
      } else if (axiosError.request) {
        errorMessage = "No response received from server. Please check that the FastAPI server is running."
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzingPrimary(false)
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market Research Engine</h1>
            <p className="text-gray-600 dark:text-gray-400">Conduct comprehensive market research</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        {currentStep === 1 ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
              {/* Header */}
              <div className="p-6 border-b dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Research File Upload</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Upload your research data files for analysis
                </p>
              </div>

              <div className="p-6">
                {/* Secondary Research File Upload Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Secondary Research Data</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Quantitative Data</Label>
                      <div className="mt-2 flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {!quantFile ? (
                              <>
                                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">CSV file with quantitative data (MAX. 10MB)</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Example: realistic_shoe_company_data.csv</p>
                              </>
                            ) : (
                              <>
                                <FileText className="w-8 h-8 mb-4 text-green-500" />
                                <p className="mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium">{quantFile.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{(quantFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="mt-2 text-red-500 hover:text-red-700"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setQuantFile(null);
                                    setQuantFileDescription('');
                                  }}
                                >
                                  Remove
                                </Button>
                              </>
                            )}
                          </div>
                          <input 
                            id="dropzone-file-secondary" 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleFileChange(e, 'secondary')}
                            accept=".csv,.xlsx,.xls"
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Description</Label>
                      <Textarea 
                        className="mt-1" 
                        rows={2} 
                        placeholder="Briefly describe what this quantitative data represents..."
                        value={quantFileDescription}
                        onChange={(e) => setQuantFileDescription(e.target.value)}
                      />
                    </div>
                    
                    {/* Secondary Analysis Button */}
                    <div className="mt-4">
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        onClick={analyzeSecondaryData}
                        disabled={isAnalyzingSecondary || !quantFile}
                      >
                        {isAnalyzingSecondary ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Secondary Data...
                          </>
                        ) : (
                          <>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Analyze Secondary Data
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Primary Research File Upload Section */}
                <div className="mb-6 mt-8 border-t dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Primary Research Data</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Qualitative Data</Label>
                      <div className="mt-2 flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {!primaryFile ? (
                              <>
                                <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">CSV file with customer feedback (MAX. 10MB)</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Example: sample_sentiment_data.csv</p>
                              </>
                            ) : (
                              <>
                                <FileText className="w-8 h-8 mb-4 text-green-500" />
                                <p className="mb-2 text-sm text-gray-700 dark:text-gray-300 font-medium">{primaryFile.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{(primaryFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="mt-2 text-red-500 hover:text-red-700"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setPrimaryFile(null);
                                    setPrimaryFileDescription('');
                                  }}
                                >
                                  Remove
                                </Button>
                              </>
                            )}
                          </div>
                          <input 
                            id="dropzone-file-primary" 
                            type="file" 
                            className="hidden" 
                            onChange={(e) => handleFileChange(e, 'primary')}
                            accept=".csv,.xlsx,.xls"
                          />
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Description</Label>
                      <Textarea 
                        className="mt-1" 
                        rows={2} 
                        placeholder="Briefly describe what this qualitative data represents..."
                        value={primaryFileDescription}
                        onChange={(e) => setPrimaryFileDescription(e.target.value)}
                      />
                    </div>
                    
                    {/* Primary Analysis Button */}
                    <div className="mt-4">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={analyzePrimaryData}
                        disabled={isAnalyzingPrimary || !primaryFile}
                      >
                        {isAnalyzingPrimary ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing Primary Data...
                          </>
                        ) : (
                          <>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Analyze Primary Data
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
              <div className="p-6 border-b dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Research Analysis Results</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Analysis of your uploaded research data
                </p>
              </div>

              <div className="p-6">
                {/* Display any errors */}
                {(secondaryResults?.error || primaryResults?.error) && (
                  <div className="mb-6 p-4 border border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-800 rounded-md">
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Analysis Errors</h3>
                    {secondaryResults?.error && (
                      <div className="mb-2">
                        <h4 className="font-medium text-red-600 dark:text-red-500">Secondary Analysis Error:</h4>
                        <pre className="mt-1 text-sm whitespace-pre-wrap text-red-600 dark:text-red-500 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-900">
                          {typeof secondaryResults.error === 'string' ? secondaryResults.error : JSON.stringify(secondaryResults.error, null, 2)}
                        </pre>
                      </div>
                    )}
                    {primaryResults?.error && (
                      <div>
                        <h4 className="font-medium text-red-600 dark:text-red-500">Primary Analysis Error:</h4>
                        <pre className="mt-1 text-sm whitespace-pre-wrap text-red-600 dark:text-red-500 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-900">
                          {typeof primaryResults.error === 'string' ? primaryResults.error : JSON.stringify(primaryResults.error, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Analysis Status Indicators */}
                <div className="mb-6 flex flex-wrap gap-3">
                  {secondaryResults && !secondaryResults.error && (
                    <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full px-4 py-1 text-sm font-medium inline-flex items-center">
                      <svg className="w-3.5 h-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                      Secondary Analysis Complete
                    </div>
                  )}
                  {primaryResults && primaryResults.success && (
                    <div className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full px-4 py-1 text-sm font-medium inline-flex items-center">
                      <svg className="w-3.5 h-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                      Primary Analysis Complete
                    </div>
                  )}
                </div>

                {/* Secondary Research Results */}
                {secondaryResults && !secondaryResults.error && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex justify-between items-center">
                      <span>Secondary Research Analysis</span>
                      {secondaryResults.timestamp && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center" 
                          onClick={() => {
                            window.open(`${FASTAPI_SECONDARY_URL}/download_secondary_report/${secondaryResults.timestamp}`, '_blank')
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
                        </Button>
                      )}
                    </h3>
                    
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Total Products</h4>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{secondaryResults.summary.total_products}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Total Sales</h4>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">${secondaryResults.summary.total_sales.toLocaleString()}</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">Total Quantity Sold</h4>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{secondaryResults.summary.total_quantity_sold.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {/* Insights */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Key Insights</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {secondaryResults.insights.map((insight: string, index: number) => (
                          <li key={index} className="text-gray-700 dark:text-gray-300">{insight}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Charts */}
                    <div className="space-y-6">
                      {secondaryResults.charts && secondaryResults.charts.map((chart: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">{chart.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{chart.description}</p>
                          <div className="flex justify-center">
                            <img 
                              src={`${FASTAPI_SECONDARY_URL}${chart.path}`}
                              alt={chart.title}
                              className="max-w-full h-auto rounded-lg"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Secondary Research Debug */}
                {secondaryResults && !secondaryResults.charts?.length && (
                  <div className="mb-8 p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800 rounded-md">
                    <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Secondary Analysis Debug Info</h3>
                    <p className="mb-2 text-yellow-600 dark:text-yellow-500">No charts were generated from the secondary analysis. Raw results:</p>
                    <pre className="text-sm whitespace-pre-wrap text-yellow-600 dark:text-yellow-500 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-900">
                      {JSON.stringify(secondaryResults, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Primary Research Results */}
                {primaryResults && primaryResults.success && (
                  <div className="mb-8 pt-8 border-t dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex justify-between items-center">
                      <span>Primary Research Analysis</span>
                      {primaryResults.timestamp && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center" 
                          onClick={() => {
                            window.open(`${FASTAPI_SERVER_URL}/download_primary_report/${primaryResults.timestamp}`, '_blank')
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
                        </Button>
                      )}
                    </h3>
                    
                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Total Responses</h4>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{primaryResults.metrics.totalResponses}</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Positive</h4>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">{primaryResults.metrics.positiveCount}</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Negative</h4>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">{primaryResults.metrics.negativeCount}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">Neutral</h4>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{primaryResults.metrics.neutralCount}</p>
                      </div>
                    </div>
                    
                    {/* Graphs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {primaryResults.graphs && Object.entries(primaryResults.graphs).map(([key, path]: [string, any]) => (
                        <div key={key} className="border rounded-lg p-4">
                          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
                            {key === 'painPointsGraph' ? 'Pain Points Analysis' : 
                             key === 'opportunitiesGraph' ? 'Opportunities Analysis' : 
                             key === 'sentimentGraph' ? 'Sentiment Distribution' : key}
                          </h4>
                          <div className="flex justify-center">
                            <img 
                              src={`${FASTAPI_SERVER_URL}${path}`}
                              alt={key}
                              className="max-w-full h-auto rounded-lg"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Quotes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Positive Quotes */}
                      <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
                        <h4 className="text-md font-medium text-green-800 dark:text-green-300 mb-2">Top Positive Quotes</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {primaryResults.topPositiveQuotes.map((quote: string, index: number) => (
                            <li key={index} className="text-gray-700 dark:text-gray-300 text-sm">{quote}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Negative Quotes */}
                      <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
                        <h4 className="text-md font-medium text-red-800 dark:text-red-300 mb-2">Top Negative Quotes</h4>
                        <ul className="list-disc pl-5 space-y-2">
                          {primaryResults.topNegativeQuotes.map((quote: string, index: number) => (
                            <li key={index} className="text-gray-700 dark:text-gray-300 text-sm">{quote}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Back Button */}
                <div className="mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Upload New Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
