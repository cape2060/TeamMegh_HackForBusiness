# Research Analysis FastAPI Services

This project provides two FastAPI services for analyzing research data:

1. **Primary Research API** - Analyzes qualitative customer feedback data
2. **Secondary Research API** - Analyzes quantitative business/sales data

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Start both FastAPI servers:
   ```
   # On Windows
   start_all_apis.bat
   
   # Or start them individually
   start_fastapi.bat        # Starts primary research API
   start_secondary_api.bat  # Starts secondary research API
   ```

3. The servers will run on:
   - Primary API: http://localhost:8000
   - Secondary API: http://localhost:8001

## API Endpoints

### Primary Research API (Port 8000)

#### POST /analyze_primary

Analyzes customer sentiment data and generates insights.

**Request:**
- Form data:
  - `file`: CSV file with at least 'feedback' and 'sentiment' columns
  - `description`: Optional description of the data

**Response:**
```json
{
  "success": true,
  "metrics": {
    "totalResponses": 100,
    "positiveCount": 70,
    "negativeCount": 30,
    "neutralCount": 0
  },
  "graphs": {
    "painPointsGraph": "/temp/output/pain_points_1234567890.png",
    "opportunitiesGraph": "/temp/output/opportunities_1234567890.png",
    "sentimentGraph": "/temp/output/sentiment_dist_1234567890.png"
  },
  "topPositiveQuotes": ["Great product!", "..."],
  "topNegativeQuotes": ["Poor service", "..."],
  "timestamp": 1234567890123
}
```

#### GET /download_primary_report/{timestamp}

Generates and downloads a PDF report for primary research analysis.

**Response:**
- PDF file containing all visualizations, metrics, and quotes from the analysis

### Secondary Research API (Port 8001)

#### POST /analyze_secondary

Analyzes quantitative business data and generates visualizations.

**Request:**
- Form data:
  - `file`: CSV file with business data (see sample format below)
  - `description`: Optional description of the data

**Response:**
```json
{
  "success": true,
  "charts": [
    {
      "title": "Total Sales by Product Niche",
      "path": "/temp/output/sales_by_niche_1234567890.png",
      "description": "Comparison of total sales across different product niches"
    },
    {
      "title": "Top 5 Products by Quantity Sold",
      "path": "/temp/output/top_products_1234567890.png",
      "description": "The five best-selling products by quantity"
    },
    {
      "title": "BCG Matrix Analysis",
      "path": "/temp/output/bcg_matrix_1234567890.png",
      "description": "Product portfolio analysis using the BCG matrix"
    }
  ],
  "insights": [
    "Top selling product niche: Athletic Shoes with $1250000 in sales",
    "Best selling product: Pro Running Shoe X1 with 5000 units sold", 
    "Portfolio composition: 4 Stars, 6 Cash Cows, 3 Question Marks, 7 Dogs"
  ],
  "summary": {
    "total_products": 20,
    "total_sales": 3750000,
    "total_quantity_sold": 25000,
    "average_market_growth": 12.5,
    "average_market_share": 0.45
  },
  "timestamp": 1234567890123
}
```

#### GET /download_secondary_report/{timestamp}

Generates and downloads a PDF report for secondary research analysis.

**Response:**
- PDF file containing all charts, summary metrics, and insights from the analysis

## Sample CSV Formats

### Primary Research Data
```
feedback,sentiment
"Great product, really love it!",positive
"Customer service was terrible",negative
```

### Secondary Research Data
```
product_details,product_niche,total_sales,total_qty_sold,relative_market_share,market_growth
"Pro Running Shoe X1","Athletic Shoes",500000,5000,0.75,15.2
"Casual Loafer C2","Casual Footwear",250000,3000,0.45,8.3
```

## Integration with Frontend

The React frontend will connect directly to these FastAPI services for research analysis rather than going through the Node.js backend.