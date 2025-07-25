const express = require('express');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize Google Generative AI
// Use a test API key for demo purposes if none is provided in environment
const DEMO_API_KEY = "AIzaSyDdu0AHh87dCI4q4nj-o5D3zBc6UPGC-Y0"; // This is a placeholder and won't work - replace with your actual key for testing
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || DEMO_API_KEY);
global.genAI = genAI;

// Log API key status
console.log(`Google Generative AI initialized: ${process.env.GOOGLE_API_KEY ? 'Using environment API key' : 'Using demo/fallback API key - PLEASE SET GOOGLE_API_KEY IN ENVIRONMENT FOR PRODUCTION'}`);

// API Configuration for Gemini
console.log("Available API models:", genAI.listModels ? "API configured correctly" : "API configuration issue!");

// Import routes
const userRoutes = require('./routes/userRoutes');
const businessDataRoutes = require('./routes/businessDataRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const bcgMatrixRoutes = require('./routes/bcgMatrixRoutes');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
// Authentication middleware disabled for demo

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Enable CORS for all routes with specific options
app.use(cors({
  origin: ['http://localhost:3000'], // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// File upload middleware
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: path.join(__dirname, '../../temp/uploads/')
}));

// Static files for temporary access
// Log the static file paths for debugging
const tempPath1 = path.join(__dirname, '../temp');
const tempPath2 = path.join(__dirname, '../../temp');
console.log('Serving static files from:', tempPath1);
console.log('Serving static files from:', tempPath2);

app.use('/temp', express.static(tempPath1));
app.use('/temp', express.static(tempPath2));

// Routes - no authentication for demo
app.use('/api/users', userRoutes);
app.use('/api/business-data', businessDataRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/bcg-matrix', bcgMatrixRoutes);

// Health check endpoint with detailed info
app.get('/api/health', (req, res) => {
  // Include filesystem access test
  try {
    const fs = require('fs');
    const path = require('path');
    
    const tempDirPath = path.join(__dirname, '../../temp');
    const tempOutputPath = path.join(tempDirPath, 'output');
    
    // Check if directories exist
    const tempDirExists = fs.existsSync(tempDirPath);
    const tempOutputExists = fs.existsSync(tempOutputPath);
    
    // Try creating a test file
    const testFilePath = path.join(tempOutputPath, `test_${Date.now()}.txt`);
    fs.writeFileSync(testFilePath, 'test');
    const canWrite = fs.existsSync(testFilePath);
    
    // Try to clean up
    try {
      if (canWrite) {
        fs.unlinkSync(testFilePath);
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    
    res.json({
      status: 'ok',
      message: 'API is running',
      fileSystem: {
        tempDirExists,
        tempOutputExists,
        canWrite,
        paths: {
          tempDir: tempDirPath,
          tempOutput: tempOutputPath
        }
      },
      time: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'API health check failed',
      error: error.message
    });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;