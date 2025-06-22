"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Megaphone, TrendingUp, Users, Target, Calendar, Loader2, BrainCircuit, Database, AlertCircle, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Debug utility function to safely parse JSON and log detailed errors
const safeJsonParse = (text: string, context: string = "unknown") => {
  try {
    // Check if the text is empty or not a string
    if (!text || typeof text !== 'string') {
      console.error(`[${context}] Invalid JSON input:`, text);
      return null;
    }
    
    // Handle empty object case
    if (text === '{}') {
      console.log(`[${context}] Empty JSON object received`);
      return {};
    }
    
    // Log the first 100 characters for debugging
    console.log(`[${context}] Attempting to parse JSON:`, text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    
    // Check for common issues
    if (text.startsWith('<')) {
      console.error(`[${context}] Received HTML instead of JSON:`, text.substring(0, 200));
      return null;
    }
    
    // Try to parse the JSON
    return JSON.parse(text);
  } catch (error) {
    // Log detailed error information
    console.error(`[${context}] JSON parse error:`, error);
    console.error(`[${context}] Raw text (first 200 chars):`, text.substring(0, 200));
    
    // Try to identify the problematic character
    if (error instanceof SyntaxError && error.message.includes('position')) {
      const match = error.message.match(/position (\d+)/);
      if (match && match[1]) {
        const position = parseInt(match[1], 10);
        const start = Math.max(0, position - 10);
        const end = Math.min(text.length, position + 10);
        console.error(`[${context}] Problem near position ${position}:`, 
          text.substring(start, position) + '👉' + text.charAt(position) + '👈' + text.substring(position + 1, end));
      }
    }
    
    return null;
  }
};

// Define interface for strategy objects
interface Strategy {
  id: string | number;  // Use string or number IDs for flexibility
  name: string;
  description: string;
  type: string;
  status: string;
  progress: number;
  targetAudience: string;
  channels: string[];
  metrics: {
    reach: string;
    engagement: string;
    conversion: string;
    revenue: string;
  };
  aiGenerated?: boolean;
  objectives?: string;
  outcomes?: string;
  timeline?: string;
  budget?: string;
  dataSource?: {
    id: string | number;
    name: string;
  };
  dbId?: string | number; // Database ID for saved strategies
}

// Create a default empty strategy object
const emptyStrategy: Strategy = {
  id: 0,
  name: "",
  description: "",
  type: "Launch",
  status: "Draft",
  progress: 0,
  targetAudience: "",
  channels: [],
  metrics: {
    reach: "TBD",
    engagement: "TBD",
    conversion: "TBD",
    revenue: "TBD",
  }
};

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([])

  const [userDatasets, setUserDatasets] = useState<any[]>([])
  const [selectedDataset, setSelectedDataset] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [aiStrategies, setAiStrategies] = useState<Strategy[]>([])
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState<boolean>(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [strategyToDelete, setStrategyToDelete] = useState<Strategy | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
  const [strategyToEdit, setStrategyToEdit] = useState<Strategy | null>(null)
  const [editedStrategy, setEditedStrategy] = useState<Partial<Strategy>>({})
  const [isImplementDialogOpen, setIsImplementDialogOpen] = useState<boolean>(false)
  const [strategyToImplement, setStrategyToImplement] = useState<Strategy | null>(null)

  // Effect to sync AI strategies with localStorage whenever they change
  useEffect(() => {
    if (aiStrategies.length > 0) {
      localStorage.setItem('aiMarketingStrategies', JSON.stringify(aiStrategies));
      console.log(`Saved ${aiStrategies.length} AI strategies to localStorage`);
    }
  }, [aiStrategies]);
  
  useEffect(() => {
    // Load AI strategies from localStorage
    try {
      const localAiStrategies = localStorage.getItem('aiMarketingStrategies');
      if (localAiStrategies) {
        const parsedAiStrategies = JSON.parse(localAiStrategies);
        if (Array.isArray(parsedAiStrategies) && parsedAiStrategies.length > 0) {
          console.log(`Loaded ${parsedAiStrategies.length} AI strategies from localStorage`);
          setAiStrategies(parsedAiStrategies);
        }
      }
    } catch (error) {
      console.error('Error loading AI strategies from localStorage:', error);
    }
    
    // Load user datasets from local storage first
    const localData = JSON.parse(localStorage.getItem('uploadedData') || '[]');
    setUserDatasets(localData);
    
    // Then try to fetch from API
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('http://localhost:5000/api/business-data', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Filter for customer data only
          const customerData = data.filter((item: any) => 
            item.data_type === 'customer_data' || 
            item.data_type === 'customer_data_batch'
          );
          
          if (customerData.length > 0) {
            // Merge with local data, ensuring no duplicates
            const mergedData = [...customerData];
            
            // Add local data that doesn't exist in the API data
            localData.forEach((localItem: any) => {
              const exists = customerData.some((apiItem: any) => 
                apiItem.id === localItem.id || 
                (apiItem.data_name === localItem.name && apiItem.created_at === localItem.date)
              );
              
              if (!exists) {
                // Format local item to match API format
                mergedData.push({
                  id: localItem.id,
                  data_name: localItem.name,
                  data_type: 'customer_data',
                  data_content: localItem.dataContent || JSON.stringify({
                    columns: localItem.columns || [],
                    customers: localItem.data || []
                  }),
                  created_at: localItem.date
                });
              }
            });
            
            setUserDatasets(mergedData);
            console.log("Datasets loaded:", mergedData.length);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    // Fetch saved strategy drafts
    const fetchSavedStrategies = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('http://localhost:5000/api/analysis/type/strategy_draft', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Log response status and headers
        console.log("Initial fetch response status:", response.status, response.statusText);
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        console.log("Initial fetch response headers:", headers);
        
        if (response.ok) {
          // Get the raw text response
          const responseText = await response.text();
          
          // Try to parse the response as JSON using our safe parser
          const savedAnalysesResult = safeJsonParse(responseText, "fetchSavedStrategies");
          
          if (savedAnalysesResult && Array.isArray(savedAnalysesResult) && savedAnalysesResult.length > 0) {
            // Extract strategies from analysis content
            const savedStrategies = savedAnalysesResult
              .map((analysis: any) => {
                try {
                  // Skip if analysis_content is empty or undefined
                  if (!analysis.analysis_content) {
                    console.log(`Analysis ID ${analysis.id} has empty content, skipping`);
                    return null;
                  }
                  
                  // Ensure analysis_content is a string
                  if (typeof analysis.analysis_content !== 'string') {
                    
                    
                    // If it's already an object, we can try to use it directly
                    if (typeof analysis.analysis_content === 'object' && analysis.analysis_content !== null) {
                      console.log(`Analysis ID ${analysis.id} already has object content, using directly`);
                      const directContent = analysis.analysis_content;
                      
                      // Check if this already has a strategy property
                      if (directContent.strategy) {
                        return {
                          ...directContent.strategy,
                          dbId: analysis.id,
                          dataSource: {
                            id: analysis.data_id,
                            name: directContent.strategy.dataSource?.name || 'Unknown dataset'
                          }
                        };
                      }
                    }
                    
                    return null;
                  }
                  
                  // Special handling for empty objects
                  if (analysis.analysis_content === '{}') {
                    console.log(`Analysis ID ${analysis.id} has empty object content {}, skipping`);
                    return null;
                  }
                  
                  // Use direct JSON parsing with error handling
                  let content;
                  try {
                    content = JSON.parse(analysis.analysis_content);
                  } catch (error) {
                    console.error(`Analysis ID ${analysis.id} has invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    
                    // Try to clean the JSON content for any analysis with errors
                    try {
                      // Try to remove BOM or other problematic characters
                      const cleanedContent = analysis.analysis_content
                        .replace(/^\uFEFF/, '')  // Remove BOM if present
                        .replace(/^\u00EF\u00BB\u00BF/, '') // Remove UTF-8 BOM
                        .trim();
                        
                      if (cleanedContent !== analysis.analysis_content) {
                        // Try parsing the cleaned content
                        const parsedContent = JSON.parse(cleanedContent);
                        console.log(`Successfully recovered JSON for Analysis ID ${analysis.id}`);
                        
                        // If we fixed it, proceed with the cleaned content
                        content = parsedContent;
                      } else {
                        return null; // No change, so skip this item
                      }
                    } catch (cleanError) {
                      console.error(`Could not recover JSON for Analysis ID ${analysis.id}`);
                      return null; // Skip this invalid item
                    }
                  }
                  
                  // Skip if content is empty
                  if (!content || Object.keys(content).length === 0) {
                    console.log(`Analysis ID ${analysis.id} has empty content object, skipping`);
                    return null;
                  }
                  
                  // Check if strategy is present in content
                  if (!content.strategy) {
                    console.log(`Analysis ID ${analysis.id} has no strategy in content, skipping`);
                    return null;
                  }
                  
                  // Create a safe copy of the strategy with all required fields
                  if (typeof content.strategy !== 'object' || content.strategy === null) {
                    console.log(`Analysis ID ${analysis.id} has invalid strategy format, skipping`);
                    return null;
                  }
                  
                  const strategy = content.strategy;
                  
                  // Ensure strategy has minimum required fields
                  if (!strategy.id || !strategy.name || !strategy.type) {
                    console.log(`Analysis ID ${analysis.id} has incomplete strategy data, skipping`);
                    return null;
                  }
                  
                  return {
                    ...strategy,
                    dbId: analysis.id, // Store the database ID for future updates
                    dataSource: {
                      id: analysis.data_id,
                      name: strategy.dataSource?.name || 'Unknown dataset'
                    }
                  };
                } catch (e) {
                  console.error('Error parsing saved strategy:', e);
                  return null;
                }
              })
              .filter((item): item is Strategy => item !== null); // Remove any null entries and provide type guard
            
            if (savedStrategies.length > 0) {
              console.log(`Loaded ${savedStrategies.length} saved strategy drafts`);
              setStrategies(prev => {
                // Merge with existing strategies, avoiding duplicates
                const existingIds = new Set(prev.map(s => s.id));
                const newStrategies = savedStrategies.filter(s => !existingIds.has(s.id));
                return [...prev, ...newStrategies];
              });
            }
          }
        } else {
          console.error("Failed to fetch initial saved strategies:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching saved strategies:", error);
      }
    };
    
    fetchUserData();
    fetchSavedStrategies();
  }, []);

  const generateStrategies = async () => {
    if (!selectedDataset) {
      setAnalysisError("Please select a dataset first");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setUsingFallback(false); // Reset fallback flag
    
    try {
      // First, fetch all saved strategies to ensure we don't lose them and keep them
      const savedStrategiesList = await fetchAllSavedStrategies();
      // Keep existing AI strategies
      const existingAiStrategies = [...aiStrategies];
      
      const token = localStorage.getItem('token');
      if (!token) {
        setAnalysisError("Authentication required. Please login again.");
        setIsAnalyzing(false);
        return;
      }
      
      // Log the selected dataset for debugging
      console.log("Generating strategies for dataset ID:", selectedDataset);
      const selectedData = userDatasets.find((dataset) => 
        dataset.id.toString() === selectedDataset.toString()
      );
      console.log("Selected dataset:", selectedData?.data_name || "Not found");
      
      if (!selectedData) {
        setAnalysisError("Selected dataset not found. Please try again.");
        setIsAnalyzing(false);
        return;
      }
      
      // Set a timeout to handle potential long-running requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds timeout
      
      try {
        // Send the request to the backend with the selected dataset ID
        const response = await fetch('http://localhost:5000/api/analysis/strategies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            dataId: selectedDataset,
            dataName: selectedData.data_name || selectedData.name,
            dataType: selectedData.data_type || 'customer_data'
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Always log the raw response for debugging
        console.log("API response status:", response.status);
        console.log("API response status text:", response.statusText);
        
        // Clone the response so we can log the body and still use it
        const responseClone = response.clone();
        const responseText = await responseClone.text();
        console.log("API response body:", responseText);
        
        // Try to parse the response as JSON using our safe parser
        const data = safeJsonParse(responseText, "generateStrategies");
        
        if (!data) {
          console.error("Error parsing response as JSON");
          console.error("Raw response:", responseText);
          setAnalysisError(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
          
          // Continue with default strategies and preserve saved strategies
          setDefaultStrategies(selectedData);
          
          // Make sure we preserve all saved strategies even when using default strategies
          if (savedStrategiesList.length > 0) {
            setStrategies(prevStrategies => {
              const existingIds = new Set(prevStrategies.map(s => s.id));
              const existingDbIds = new Set(prevStrategies
                .filter(s => s.dbId)
                .map(s => s.dbId));
              
              const newSavedStrategies = savedStrategiesList.filter(s => 
                !existingIds.has(s.id) && !existingDbIds.has(s.dbId)
              );
              
              if (newSavedStrategies.length > 0) {
                return [...prevStrategies, ...newSavedStrategies];
              }
              
              return prevStrategies;
            });
          }
          return;
        }
        
        if (response.ok) {
          if (!data.strategies || !Array.isArray(data.strategies) || data.strategies.length === 0) {
            console.error("API returned empty or invalid strategies", data);
            setAnalysisError("The AI couldn't generate strategies from this data. Please try a different dataset.");
            return;
          }
          
          console.log("Received strategies:", data.strategies);
          
          // Transform the AI strategies to match our UI format
          const formattedStrategies = data.strategies.map((strategy: any, index: number) => {
            const formattedStrategy = {
              id: Date.now() + index,
              name: strategy.name || `Strategy ${index + 1}`,
              description: strategy.objectives ? (strategy.objectives.split('.')[0] + '.') : "Improve business outcomes through targeted marketing.",
              type: strategy.type || "Launch",
              status: "Draft",
              progress: 0,
              targetAudience: strategy.targetAudience || "All customers",
              channels: Array.isArray(strategy.channels) ? strategy.channels : [strategy.channels || "Email"],
              metrics: {
                reach: "TBD",
                engagement: "TBD",
                conversion: "TBD",
                revenue: "TBD",
              },
              aiGenerated: true,
              objectives: strategy.objectives || "Increase customer engagement and drive sales",
              outcomes: strategy.outcomes || "Improved brand awareness and customer retention",
              timeline: strategy.timeline || "3 months",
              budget: strategy.budget || "Medium investment required",
              dataSource: {
                id: selectedDataset,
                name: selectedData.data_name || selectedData.name
              }
            };
            return formattedStrategy;
          });
          
          // Automatically save all generated strategies to the database
          try {
            console.log(`Auto-saving ${formattedStrategies.length} AI-generated strategies...`);
            
            // Save each strategy in parallel
            await Promise.all(formattedStrategies.map(async (strategy: Strategy) => {
              // Prepare strategy data for saving
              const strategyData = {
                dataId: selectedDataset,
                analysisType: 'strategy_draft',
                analysisContent: JSON.stringify({
                  strategy: {
                    ...strategy,
                    status: "Draft",
                    progress: 0,
                    savedAt: new Date().toISOString(),
                    metrics: {
                      reach: "TBD",
                      engagement: "TBD",
                      conversion: "TBD",
                      revenue: "TBD",
                    }
                  }
                })
              };
              
              try {
                // Save to database
                const response = await fetch('http://localhost:5000/api/analysis', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(strategyData)
                });
                
                if (response.ok) {
                  const savedData = await response.json();
                  console.log(`Strategy "${strategy.name}" auto-saved with ID: ${savedData.id}`);
                  
                  // Update the strategy with the database ID
                  strategy.dbId = savedData.id;
                } else {
                  console.error(`Failed to auto-save strategy "${strategy.name}":`, await response.text());
                }
              } catch (saveError) {
                console.error(`Error auto-saving strategy "${strategy.name}":`, saveError);
              }
            }));
            
            console.log("Auto-save complete");
          } catch (autoSaveError) {
            console.error("Error during auto-save process:", autoSaveError);
            // Continue execution - don't block the UI for auto-save errors
          }
          
                                // Add new strategies to existing ones without removing previous ones
          setAiStrategies([...existingAiStrategies, ...formattedStrategies]);
          
          // Show success notification
          alert(`Successfully generated ${formattedStrategies.length} marketing strategies!`);
          
          // Scroll to the AI strategies section for better UX
          setTimeout(() => {
            const aiTabElement = document.getElementById("ai-tab");
            if (aiTabElement) {
              aiTabElement.scrollIntoView({ behavior: "smooth" });
            }
          }, 100);
          
          // IMPORTANT: Make sure we preserve all saved strategies
          if (savedStrategiesList.length > 0) {
            console.log(`Preserving ${savedStrategiesList.length} saved draft strategies`);
            
            // Update existing strategies, ensuring we don't lose any saved drafts
            setStrategies(prevStrategies => {
              // Create a set of existing IDs for quick lookup
              const existingIds = new Set(prevStrategies.map(s => s.id));
              const existingDbIds = new Set(prevStrategies
                .filter(s => s.dbId)
                .map(s => s.dbId));
              
              // Filter out saved strategies that are already in the list
              const newSavedStrategies = savedStrategiesList.filter(s => 
                !existingIds.has(s.id) && !existingDbIds.has(s.dbId)
              );
              
              if (newSavedStrategies.length > 0) {
                return [...prevStrategies, ...newSavedStrategies];
              }
              
              return prevStrategies;
            });
          }
          
          // Show warning if there was one
          if (data.warning) {
            console.warn("API warning:", data.warning);
          }
        } else {
          let errorMessage = "Error generating strategies";
          
          if (data && data.message) {
            errorMessage = data.message;
          }
          
          // Show more detailed error information if available
          if (data && data.error) {
            console.error("Error details:", data.error);
            errorMessage += `: ${data.error}`;
          }
          
          if (data && data.details) {
            console.error("Additional details:", data.details);
            errorMessage += ` (${typeof data.details === 'object' ? JSON.stringify(data.details) : data.details})`;
          }
          
          setAnalysisError(errorMessage);
          
          // Show default strategies even if there's an error
          setDefaultStrategies(selectedData);
          
          // IMPORTANT: Make sure we preserve all saved strategies even when using default strategies
          if (savedStrategiesList.length > 0) {
            setStrategies(prevStrategies => {
              const existingIds = new Set(prevStrategies.map(s => s.id));
              const existingDbIds = new Set(prevStrategies
                .filter(s => s.dbId)
                .map(s => s.dbId));
              
              const newSavedStrategies = savedStrategiesList.filter(s => 
                !existingIds.has(s.id) && !existingDbIds.has(s.dbId)
              );
              
              if (newSavedStrategies.length > 0) {
                return [...prevStrategies, ...newSavedStrategies];
              }
              
              return prevStrategies;
            });
          }
        }
      } catch (fetchError: unknown) {
        if ((fetchError as Error).name === 'AbortError') {
          setAnalysisError("Request timed out. The server took too long to respond.");
        } else {
          const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
          setAnalysisError(`Network error: ${errorMessage}`);
        }
        console.error("Fetch error:", fetchError);
        
        // Show default strategies even if there's a network error
        setDefaultStrategies(selectedData);
        
        // IMPORTANT: Make sure we preserve all saved strategies even when using default strategies
        if (savedStrategiesList.length > 0) {
          setStrategies(prevStrategies => {
            const existingIds = new Set(prevStrategies.map(s => s.id));
            const existingDbIds = new Set(prevStrategies
              .filter(s => s.dbId)
              .map(s => s.dbId));
            
            const newSavedStrategies = savedStrategiesList.filter(s => 
              !existingIds.has(s.id) && !existingDbIds.has(s.dbId)
            );
            
            if (newSavedStrategies.length > 0) {
              return [...prevStrategies, ...newSavedStrategies];
            }
            
            return prevStrategies;
          });
        }
      }
    } catch (error: unknown) {
      console.error("Error generating strategies:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setAnalysisError(`Error: ${errorMessage}`);
      setDefaultStrategies(null);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Set default strategies when API fails
  const setDefaultStrategies = (selectedData: any) => {
    // Generate a base timestamp to ensure uniqueness
    const baseTimestamp = Date.now();
    
    const defaultStrategies: Strategy[] = [
      {
        id: `${baseTimestamp}-0-${Math.random().toString(36).substring(2, 9)}`,
        name: "Customer Retention Campaign",
        description: "Re-engage inactive customers and increase repeat purchases.",
        type: "Retention",
        status: "Draft",
        progress: 0,
        targetAudience: "Existing customers who haven't purchased in 30+ days",
        channels: ["Email", "SMS", "Social Media"],
        metrics: {
          reach: "TBD",
          engagement: "TBD",
          conversion: "TBD",
          revenue: "TBD",
        },
        aiGenerated: true,
        objectives: "Re-engage inactive customers and increase repeat purchases. Focus on customers who haven't made a purchase in the last 30 days with personalized offers based on their purchase history.",
        outcomes: "Increase customer retention rate by 15% and boost repeat purchases within 3 months.",
        timeline: "3 months",
        budget: "Medium investment required",
        dataSource: selectedData ? {
          id: selectedData.id,
          name: selectedData.data_name || selectedData.name
        } : undefined
      },
      {
        id: `${baseTimestamp}-1-${Math.random().toString(36).substring(2, 9)}`,
        name: "New Customer Acquisition",
        description: "Expand customer base and increase market share.",
        type: "Launch",
        status: "Draft",
        progress: 0,
        targetAudience: "Potential customers in target demographic",
        channels: ["Social Media Ads", "Content Marketing", "Referral Program"],
        metrics: {
          reach: "TBD",
          engagement: "TBD",
          conversion: "TBD",
          revenue: "TBD",
        },
        aiGenerated: true,
        objectives: "Expand customer base and increase market share through targeted digital marketing campaigns and a new customer referral program.",
        outcomes: "Acquire 20% more customers and increase brand awareness within 6 months.",
        timeline: "6 months",
        budget: "High investment required",
        dataSource: selectedData ? {
          id: selectedData.id,
          name: selectedData.data_name || selectedData.name
        } : undefined
      },
      {
        id: `${baseTimestamp}-2-${Math.random().toString(36).substring(2, 9)}`,
        name: "Premium Product Upsell",
        description: "Increase average order value and introduce customers to premium offerings.",
        type: "Upsell",
        status: "Draft",
        progress: 0,
        targetAudience: "Existing customers who regularly purchase standard products",
        channels: ["Email", "In-app Notifications", "Personalized Recommendations"],
        metrics: {
          reach: "TBD",
          engagement: "TBD",
          conversion: "TBD",
          revenue: "TBD",
        },
        aiGenerated: true,
        objectives: "Increase average order value and introduce customers to premium offerings through personalized recommendations and targeted promotions.",
        outcomes: "Increase premium product sales by 25% and boost average order value within 4 months.",
        timeline: "4 months",
        budget: "Low to medium investment required",
        dataSource: selectedData ? {
          id: selectedData.id,
          name: selectedData.data_name || selectedData.name
        } : undefined
      }
    ];
    
    // Keep existing strategies and add the new default ones
    setAiStrategies(prevStrategies => [...prevStrategies, ...defaultStrategies]);
    setUsingFallback(true);
    
    // Auto-save default strategies to database
    const token = localStorage.getItem('token');
    if (token && selectedData) {
      // Auto-save each strategy
      defaultStrategies.forEach(async (strategy) => {
        // Prepare strategy data for saving
        const strategyData = {
          dataId: selectedData.id,
          analysisType: 'strategy_draft',
          analysisContent: JSON.stringify({
            strategy: {
              ...strategy,
              aiGenerated: true,
              status: "Draft",
              progress: 0,
              savedAt: new Date().toISOString()
            }
          })
        };
        
        try {
          // Save to database
          const response = await fetch('http://localhost:5000/api/analysis', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(strategyData)
          });
          
          if (response.ok) {
            console.log(`Default strategy "${strategy.name}" saved to database`);
          }
        } catch (error) {
          console.error(`Error auto-saving default strategy:`, error);
        }
      });
    }
  };

  // Fetch all saved strategies before generating new ones
  const fetchAllSavedStrategies = async (): Promise<Strategy[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return [];
      
      const response = await fetch('http://localhost:5000/api/analysis/type/strategy_draft', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Log response status and headers
      console.log("fetchAllSavedStrategies response status:", response.status, response.statusText);
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("fetchAllSavedStrategies response headers:", headers);
      
      if (response.ok) {
        // Get the raw text response
        const responseText = await response.text();
        
        // Try to parse the response as JSON using our safe parser
        const savedAnalysesResult = safeJsonParse(responseText, "fetchAllSavedStrategies");
        
        if (savedAnalysesResult && Array.isArray(savedAnalysesResult) && savedAnalysesResult.length > 0) {
          // Extract strategies from analysis content
          const savedStrategies = savedAnalysesResult
            .map((analysis: any) => {
              try {
                // Skip if analysis_content is empty or undefined
                if (!analysis.analysis_content) {
                  console.log(`Analysis ID ${analysis.id} has empty content, skipping`);
                  return null;
                }
                
                // Skip if it's an empty object
                if (analysis.analysis_content === '{}') {
                  console.log(`Analysis ID ${analysis.id} has empty object content {}, skipping`);
                  return null;
                }
                
                // First, ensure analysis_content is a string
                if (typeof analysis.analysis_content !== 'string') {
                  // If it's already an object, we can try to use it directly
                  if (typeof analysis.analysis_content === 'object' && analysis.analysis_content !== null) {
                    console.log(`Analysis ID ${analysis.id} already has object content, using directly`);
                    const directContent = analysis.analysis_content;
                    
                    // Check if this already has a strategy property
                    if (directContent.strategy) {
                      return {
                        ...directContent.strategy,
                        dbId: analysis.id,
                        dataSource: {
                          id: analysis.data_id,
                          name: directContent.strategy.dataSource?.name || 'Unknown dataset'
                        }
                      };
                    }
                  }
                  
                  return null;
                }
                
                // Use our safe parser for nested JSON
                let content;
                try {
                  content = JSON.parse(analysis.analysis_content);
                } catch (error) {
                  console.error(`Analysis ID ${analysis.id} has invalid JSON:`, error);
                  return null;
                }
                
                // Skip if content is empty 
                if (!content || Object.keys(content).length === 0) {
                  console.log(`Analysis ID ${analysis.id} has empty content object, skipping`);
                  return null;
                }
                
                // Check if strategy is present in content
                if (!content.strategy) {
                  console.log(`Analysis ID ${analysis.id} has no strategy in content, skipping`);
                  return null;
                }
                
                // Create a safe copy of the strategy with all required fields
                if (typeof content.strategy !== 'object' || content.strategy === null) {
                  console.log(`Analysis ID ${analysis.id} has invalid strategy format, skipping`);
                  return null;
                }
                
                const strategy = content.strategy;
                
                // Ensure strategy has minimum required fields
                if (!strategy.id || !strategy.name || !strategy.type) {
                  console.log(`Analysis ID ${analysis.id} has incomplete strategy data, skipping`);
                  return null;
                }
                
                return {
                  ...strategy,
                  dbId: analysis.id, // Store the database ID for future updates
                  dataSource: {
                    id: analysis.data_id,
                    name: strategy.dataSource?.name || 'Unknown dataset'
                  }
                };
              } catch (e) {
                console.error('Error parsing saved strategy:', e);
                return null;
              }
            })
            .filter((item): item is Strategy => item !== null); // Remove any null entries and provide type guard
          
          return savedStrategies.filter(s => s.aiGenerated === true); // Only return AI-generated strategies
        }
      } else {
        console.error("Failed to fetch saved strategies:", response.status, response.statusText);
      }
      return [];
    } catch (error) {
      console.error("Error fetching saved strategies:", error);
      return [];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
      case "Planning":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
      case "Draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Retention":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300"
      case "Launch":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300"
      case "Upsell":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const displayStrategies = aiStrategies;

  // Handle deleting a strategy
  const handleDeleteStrategy = (strategy: Strategy) => {
    setStrategyToDelete(strategy);
    setIsDeleteDialogOpen(true);
  };

  // Confirm strategy deletion - completely removes strategy from all data sources
  const confirmDeleteStrategy = async () => {
    if (!strategyToDelete) return;
    
    try {
      // If the strategy has a dbId, delete it from the backend
      if (strategyToDelete.dbId) {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Authentication required. Please login again.');
          return;
        }
        
        console.log(`Deleting strategy with DB ID: ${strategyToDelete.dbId}`);
        
        const response = await fetch(`http://localhost:5000/api/analysis/${strategyToDelete.dbId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error deleting strategy from backend:', errorText);
          throw new Error(`Failed to delete strategy: ${response.status} ${response.statusText}`);
        }
        
        console.log('Strategy successfully deleted from backend');
      } else {
        console.log('Strategy has no dbId, only removing from local state');
      }
      
      // Update only the AI strategies array
      setAiStrategies(aiStrategies.filter(s => {
        // Remove by ID match
        if (s.id === strategyToDelete.id) return false;
        // Also remove by dbId match if it exists
        if (strategyToDelete.dbId && s.dbId === strategyToDelete.dbId) return false;
        return true;
      }));
      
      // Also remove from localStorage for AI strategies
      try {
        const localStorageKey = 'aiMarketingStrategies';
        const storedStrategies = localStorage.getItem(localStorageKey);
        
        if (storedStrategies) {
          const parsedStrategies = JSON.parse(storedStrategies);
          // Filter out the deleted strategy
          const updatedStrategies = parsedStrategies.filter((s: any) => 
            s.id !== strategyToDelete.id && 
            (!strategyToDelete.dbId || s.dbId !== strategyToDelete.dbId)
          );
          
          // Save back to localStorage
          localStorage.setItem(localStorageKey, JSON.stringify(updatedStrategies));
          console.log('Strategy removed from AI strategies localStorage');
        }
      } catch (localStorageError) {
        console.error('Error updating AI strategies localStorage:', localStorageError);
      }
      
      setIsDeleteDialogOpen(false);
      setStrategyToDelete(null);
      
      // Show confirmation
      alert(`Strategy "${strategyToDelete.name}" has been permanently deleted`);
    } catch (error) {
      console.error('Error during strategy deletion:', error);
      alert(`Error deleting strategy: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Handle saving AI strategy as draft - keeps in AI strategies tab
  const handleSaveAsDraft = async (strategy: Strategy) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }
      
      // Generate a unique ID using UUID pattern to avoid duplicates
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Prepare strategy data for saving
      const strategyData = {
        dataId: strategy.dataSource?.id,
        analysisType: 'strategy_draft',
        analysisContent: JSON.stringify({
          strategy: {
            ...strategy,
            aiGenerated: true, // Ensure it stays in the AI tab
            status: "Draft",
            progress: 0,
            savedAt: new Date().toISOString(),
            metrics: {
              reach: "TBD",
              engagement: "TBD",
              conversion: "TBD",
              revenue: "TBD",
            }
          }
        })
      };
      
      console.log("Sending strategy data:", JSON.stringify(strategyData).substring(0, 200) + "...");
      
      // Check if we're updating an existing strategy or creating a new one
      const isUpdate = strategy.dbId ? true : false;
      const url = isUpdate 
        ? `http://localhost:5000/api/analysis/${strategy.dbId}` 
        : 'http://localhost:5000/api/analysis';
      const method = isUpdate ? 'PUT' : 'POST';
      
      // Save to database
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(isUpdate ? {
          analysisContent: strategyData.analysisContent
        } : strategyData)
      });
      
      // Log response headers for debugging
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("Response headers:", headers);
      console.log("Response status:", response.status, response.statusText);
      
      // Get the raw text response
      const responseText = await response.text();
      console.log("Raw response text:", responseText);
      
      // Try to parse the response as JSON using our safe parser
      const savedData = safeJsonParse(responseText, "handleSaveAsDraft");
      
      if (response.ok) {
        // Create the updated strategy
        const draftStrategy = {
          ...strategy,
          id: strategy.id || uniqueId, // Keep existing ID or create new one
          dbId: isUpdate ? strategy.dbId : savedData?.id, // Store the database ID
          status: "Draft",
          progress: 0,
          aiGenerated: true, // Ensure it stays flagged as AI-generated
          metrics: {
            reach: "TBD",
            engagement: "TBD",
            conversion: "TBD",
            revenue: "TBD",
          }
        };
        
        // Update the strategy in the AI strategies list
        const updatedAiStrategies = aiStrategies.map(s => 
          s.id === strategy.id ? draftStrategy : s
        );
        
        // If the strategy wasn't found in the list, add it
        if (!updatedAiStrategies.some(s => s.id === strategy.id)) {
          updatedAiStrategies.push(draftStrategy);
        }
        
        setAiStrategies(updatedAiStrategies);
        
        // Save to localStorage
        try {
          const localStorageKey = 'aiMarketingStrategies';
          localStorage.setItem(localStorageKey, JSON.stringify(updatedAiStrategies));
        } catch (error) {
          console.error('Error saving AI strategies to localStorage:', error);
        }
        
        // Show confirmation
        alert(`Strategy "${strategy.name}" ${isUpdate ? 'updated' : 'saved'} as draft`);
      } else {
        const errorMessage = savedData?.message || responseText || 'Failed to save strategy';
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      console.error('Error saving strategy as draft:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Error saving strategy: ${errorMessage}`);
    }
  };

  // Handle editing a strategy
  const handleEditStrategy = (strategy: Strategy) => {
    setStrategyToEdit(strategy);
    setEditedStrategy({...strategy});
    setIsEditDialogOpen(true);
  };

  // Save edited strategy
  const saveEditedStrategy = () => {
    if (!strategyToEdit || !editedStrategy) return;
    
    const updatedStrategy: Strategy = { ...strategyToEdit, ...editedStrategy };
    
    // Update only AI strategies
    setAiStrategies(aiStrategies.map((s: Strategy) => 
      s.id === strategyToEdit.id ? updatedStrategy : s
    ));
    
    setIsEditDialogOpen(false);
    setStrategyToEdit(null);
    setEditedStrategy({});
  };

  // Handle implementing a strategy
  const handleImplementStrategy = (strategy: Strategy) => {
    setStrategyToImplement(strategy);
    setIsImplementDialogOpen(true);
  };

  // Confirm strategy implementation
  const confirmImplementStrategy = () => {
    if (!strategyToImplement) return;
    
    // Update the AI strategy status
    const updatedAiStrategies = aiStrategies.map((s: Strategy) => 
      s.id === strategyToImplement.id ? {...s, status: "Active", progress: 10} : s
    );
    
    setAiStrategies(updatedAiStrategies);
    
    // Save to localStorage
    localStorage.setItem('aiMarketingStrategies', JSON.stringify(updatedAiStrategies));
    
    // If the strategy has a dbId, update it in the database
    if (strategyToImplement.dbId) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Update the status in the database
          fetch(`http://localhost:5000/api/analysis/${strategyToImplement.dbId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              analysisContent: JSON.stringify({
                strategy: {
                  ...strategyToImplement,
                  status: "Active",
                  progress: 10
                }
              })
            })
          }).then(response => {
            if (!response.ok) {
              console.error('Error updating strategy in database:', response.statusText);
            } else {
              console.log('Strategy updated in database');
            }
          }).catch(error => {
            console.error('Error updating strategy:', error);
          });
        }
      } catch (error) {
        console.error('Error updating strategy in database:', error);
      }
    }
    
    setIsImplementDialogOpen(false);
    setStrategyToImplement(null);
    
    // Show confirmation
    alert(`Strategy "${strategyToImplement.name}" is now being implemented`);
  };

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketing Strategies</h1>
            <p className="text-gray-600 dark:text-gray-400">Build campaign strategies based on customer behavior</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Megaphone className="h-4 w-4 mr-2" />
                Create Strategy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Generate AI Marketing Strategies</DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  Select a customer dataset to analyze and generate personalized marketing strategies using Gemini 1.5 Flash
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-gray-300">Select Customer Dataset</label>
                  <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                      <SelectValue placeholder="Select a dataset" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      {userDatasets.length === 0 ? (
                        <SelectItem value="no-data" disabled>No datasets available</SelectItem>
                      ) : (
                        userDatasets.map((dataset) => (
                          <SelectItem key={dataset.id} value={dataset.id.toString()}>
                            {dataset.data_name || dataset.name} ({new Date(dataset.created_at || dataset.date).toLocaleDateString()})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {userDatasets.length === 0 && (
                    <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>No customer datasets found. Please upload data first.</span>
                    </div>
                  )}
                </div>
                
                {selectedDataset && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Selected Dataset Info</h4>
                    {(() => {
                      const selected = userDatasets.find(d => d.id.toString() === selectedDataset.toString());
                      if (!selected) return <p className="text-sm text-blue-600 dark:text-blue-400">Dataset information not available</p>;
                      
                      // Parse data content if it's a string
                      let dataContent;
                      try {
                        if (typeof selected.data_content === 'string') {
                          dataContent = JSON.parse(selected.data_content);
                        } else {
                          dataContent = selected.data_content;
                        }
                      } catch (e: any) {
                        return <p className="text-sm text-red-600 dark:text-red-400">Error parsing dataset: {e.message}</p>;
                      }
                      
                      // Try to determine customer count
                      let customerCount = 0;
                      if (dataContent?.customers) {
                        customerCount = dataContent.customers.length;
                      } else if (Array.isArray(dataContent)) {
                        customerCount = dataContent.length;
                      } else if (dataContent?.dataContent?.customers) {
                        customerCount = dataContent.dataContent.customers.length;
                      }
                      
                      return (
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          <p><strong>Name:</strong> {selected.data_name || selected.name}</p>
                          <p><strong>Type:</strong> {selected.data_type || 'Customer Data'}</p>
                          <p><strong>Records:</strong> {customerCount} customers</p>
                          <p><strong>Date:</strong> {new Date(selected.created_at || selected.date).toLocaleDateString()}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
                
                {analysisError && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm font-medium">{analysisError}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="mt-4">
                <Button 
                  type="submit" 
                  onClick={generateStrategies} 
                  disabled={isAnalyzing || !selectedDataset}
                  className="w-full sm:w-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing with Gemini 1.5 Flash...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="h-4 w-4 mr-2" />
                      Generate AI Strategies
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="p-6">
        {/* Strategy Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Megaphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {aiStrategies.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Strategies</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <BrainCircuit className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {aiStrategies.filter(s => s.status === "Active").length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Strategies</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Gemini 1.5 Flash Strategies</h2>
            <p className="text-gray-600 dark:text-gray-400">AI-powered strategic marketing recommendations based on your data</p>
          </div>
          
          {aiStrategies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <BrainCircuit className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No AI Strategies Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                Generate AI-powered marketing strategies by analyzing your customer data with Gemini 1.5 Flash.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <BrainCircuit className="h-4 w-4 mr-2" />
                    Generate Strategies
                  </Button>
                </DialogTrigger>
                {/* Dialog content is defined above */}
              </Dialog>
            </div>
          ) : (
            <div className="grid gap-6">
              {aiStrategies.map((strategy) => (
                <Card key={strategy.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{strategy.name}</CardTitle>
                          <Badge className="bg-blue-500 hover:bg-blue-600">
                            {usingFallback ? "AI Generated (Fallback)" : "Gemini 1.5 Flash"}
                          </Badge>
                          <Badge variant={strategy.status === "Active" ? "default" : "secondary"}>{strategy.status}</Badge>
                        </div>
                        <CardDescription className="mt-1">{strategy.description}</CardDescription>
                        {strategy.dataSource && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Based on dataset: {strategy.dataSource.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Target Audience</div>
                        <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">{strategy.targetAudience}</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <Calendar className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-green-700 dark:text-green-300">Timeline</div>
                        <div className="text-sm text-green-600 dark:text-green-400">{strategy.timeline || "3-6 months"}</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                        <Target className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Channels</div>
                        <div className="text-xs text-purple-600 dark:text-purple-300">{strategy.channels.join(", ")}</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-orange-700 dark:text-orange-300">Budget</div>
                        <div className="text-xs text-orange-600 dark:text-orange-300">{strategy.budget || "Not specified"}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 dark:text-white">Objectives</h4>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{strategy.objectives}</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 dark:text-white">Expected Outcomes</h4>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{strategy.outcomes}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleSaveAsDraft(strategy)}
                      >
                        {strategy.dbId ? 'Update Draft' : 'Save as Draft'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleEditStrategy(strategy)}
                      >
                        Edit Strategy
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => handleImplementStrategy(strategy)}
                      >
                        Implement Strategy
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => handleDeleteStrategy(strategy)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Strategy Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you sure you want to delete this strategy? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {strategyToDelete && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 rounded-md">
              <h4 className="font-medium text-red-800 dark:text-red-400">{strategyToDelete.name}</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{strategyToDelete.description}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteStrategy}
            >
              Delete Strategy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Strategy Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Edit Strategy</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Modify the details of your marketing strategy.
            </DialogDescription>
          </DialogHeader>
          
          {strategyToEdit && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-300">Strategy Name</label>
                <input
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editedStrategy.name || ''}
                  onChange={(e) => setEditedStrategy({...editedStrategy, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-300">Type</label>
                <select
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editedStrategy.type || ''}
                  onChange={(e) => setEditedStrategy({...editedStrategy, type: e.target.value})}
                >
                  <option value="Retention">Retention</option>
                  <option value="Launch">Launch</option>
                  <option value="Upsell">Upsell</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-300">Description</label>
                <textarea
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editedStrategy.description || ''}
                  onChange={(e) => setEditedStrategy({...editedStrategy, description: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-300">Target Audience</label>
                <textarea
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editedStrategy.targetAudience || ''}
                  onChange={(e) => setEditedStrategy({...editedStrategy, targetAudience: e.target.value})}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-300">Objectives</label>
                <textarea
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editedStrategy.objectives || ''}
                  onChange={(e) => setEditedStrategy({...editedStrategy, objectives: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-gray-300">Channels (comma-separated)</label>
                <input
                  className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={Array.isArray(editedStrategy.channels) ? editedStrategy.channels.join(', ') : ''}
                  onChange={(e) => setEditedStrategy({
                    ...editedStrategy, 
                    channels: e.target.value.split(',').map((item: string) => item.trim())
                  })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveEditedStrategy}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Implement Strategy Dialog */}
      <Dialog open={isImplementDialogOpen} onOpenChange={setIsImplementDialogOpen}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Implement Strategy</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Are you ready to implement this marketing strategy?
            </DialogDescription>
          </DialogHeader>
          
          {strategyToImplement && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 rounded-md">
              <h4 className="font-medium text-blue-800 dark:text-blue-400">{strategyToImplement.name}</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{strategyToImplement.description}</p>
              <div className="mt-3 text-sm text-blue-600 dark:text-blue-400">
                <p><strong>Target:</strong> {strategyToImplement.targetAudience}</p>
                <p><strong>Channels:</strong> {Array.isArray(strategyToImplement.channels) ? strategyToImplement.channels.join(', ') : strategyToImplement.channels}</p>
                <p><strong>Timeline:</strong> {strategyToImplement.timeline}</p>
                {strategyToImplement.dataSource && (
                  <p className="mt-2 text-xs">
                    <strong>Based on dataset:</strong> {strategyToImplement.dataSource.name}
                  </p>
                )}
              </div>
              
              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/40 rounded-md">
                <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300">Implementation Notes</h5>
                <ul className="mt-2 text-xs text-blue-700 dark:text-blue-400 list-disc pl-4 space-y-1">
                  <li>Strategy will be marked as "Active"</li>
                  <li>Initial progress will be set to 10%</li>
                  <li>You can track and update progress in the Existing Strategies tab</li>
                  <li>Implementation will require team coordination and resource allocation</li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsImplementDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmImplementStrategy}
            >
              Start Implementation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
