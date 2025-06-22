from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os
import tempfile
import time
import json
import shutil
from typing import Optional, List, Dict, Any
import io

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create output directory if it doesn't exist
output_dir = os.path.join(os.path.dirname(__file__), '../temp/output')
os.makedirs(output_dir, exist_ok=True)

# Mount the static directory for serving images
app.mount("/temp/output", StaticFiles(directory=output_dir), name="output")

@app.post("/analyze_niche_market")
async def analyze_niche_market(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None)
):
    """
    Analyze market data to identify profitable niche markets.
    Expects a CSV file with market data including:
    - product categories
    - sales data
    - customer segments
    - profit margins
    """
    # Create a timestamp for unique filenames
    timestamp = int(time.time() * 1000)
    
    try:
        # Save uploaded file to a temporary location
        temp_file_path = f"{output_dir}/temp_{timestamp}_{file.filename}"
        with open(temp_file_path, "wb") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
        
        # Load and process the data
        df = pd.read_csv(temp_file_path)
        
        # Process the data to find niche markets
        results = analyze_market_data(df, timestamp)
        
        # Add timestamp to the results
        results["timestamp"] = timestamp
        
        # Clean up temporary file
        os.remove(temp_file_path)
        
        return JSONResponse(content=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def analyze_market_data(df: pd.DataFrame, timestamp: int) -> Dict[str, Any]:
    """Analyze market data to identify profitable niche markets"""
    results = {
        "success": True,
        "topNiches": [],
        "marketPotential": [],
        "recommendations": [],
        "graphs": {}
    }
    
    try:
        # Ensure required columns exist or use reasonable defaults
        required_columns = ['category', 'sales', 'profit_margin', 'customer_segment']
        
        # Check if columns exist or find suitable alternatives
        column_mapping = {}
        for req_col in required_columns:
            if req_col in df.columns:
                column_mapping[req_col] = req_col
            else:
                # Try to find alternative columns
                if req_col == 'category' and any(col in df.columns for col in ['product_category', 'niche', 'segment', 'product_type']):
                    for alt in ['product_category', 'niche', 'segment', 'product_type']:
                        if alt in df.columns:
                            column_mapping[req_col] = alt
                            break
                elif req_col == 'sales' and any(col in df.columns for col in ['revenue', 'amount', 'sales_amount', 'volume']):
                    for alt in ['revenue', 'amount', 'sales_amount', 'volume']:
                        if alt in df.columns:
                            column_mapping[req_col] = alt
                            break
                elif req_col == 'profit_margin' and any(col in df.columns for col in ['margin', 'profit', 'profitability']):
                    for alt in ['margin', 'profit', 'profitability']:
                        if alt in df.columns:
                            column_mapping[req_col] = alt
                            break
                elif req_col == 'customer_segment' and any(col in df.columns for col in ['customer', 'segment', 'demographic', 'audience']):
                    for alt in ['customer', 'segment', 'demographic', 'audience']:
                        if alt in df.columns:
                            column_mapping[req_col] = alt
                            break
        
        # Check if we have the minimum required data
        if 'category' not in column_mapping or ('sales' not in column_mapping and 'profit_margin' not in column_mapping):
            raise ValueError("Could not find required columns in the dataset")
        
        # Extract data with mapped columns
        category_col = column_mapping.get('category')
        sales_col = column_mapping.get('sales')
        profit_margin_col = column_mapping.get('profit_margin')
        segment_col = column_mapping.get('customer_segment')
        
        # Analyze sales by niche/category
        if sales_col:
            # Group by category and sum sales
            sales_by_niche = df.groupby(category_col)[sales_col].sum().sort_values(ascending=False)
            
            # Get top niches by sales
            top_niches = sales_by_niche.head(5).index.tolist()
            results["topNiches"] = top_niches
            
            # Create market potential data
            market_potential = []
            for niche, sales in sales_by_niche.head(10).items():
                potential = "High" if sales > sales_by_niche.median() * 1.5 else "Medium" if sales > sales_by_niche.median() else "Low"
                market_potential.append({
                    "niche": niche,
                    "potential": potential,
                    "sales": float(sales)
                })
            results["marketPotential"] = market_potential
            
            # Create sales by niche visualization
            plt.figure(figsize=(10, 6))
            ax = sns.barplot(x=sales_by_niche.head(10).values, y=sales_by_niche.head(10).index, palette="viridis")
            plt.title("Top  Niches by Sales", fontsize=16)
            plt.xlabel("Sales", fontsize=12)
            plt.tight_layout()
            
            # Add values to the bars
            for i, v in enumerate(sales_by_niche.head(10).values):
                ax.text(v + 0.1, i, f"{v:,.0f}", va='center')
            
            sales_chart_path = f"{output_dir}/sales_by_niche_{timestamp}.png"
            plt.savefig(sales_chart_path, dpi=120, bbox_inches='tight')
            plt.close()
            results["graphs"]["salesByNiche"] = f"/temp/output/sales_by_niche_{timestamp}.png"
            
            # Create a visualization of top products within top niches if product column exists
            if 'product' in df.columns:
                top_niche = top_niches[0]
                top_products = df[df[category_col] == top_niche].groupby('product')[sales_col].sum().sort_values(ascending=False).head(5)
                
                plt.figure(figsize=(10, 6))
                sns.barplot(x=top_products.values, y=top_products.index, palette="magma")
                plt.title(f"Top Products in {top_niche} Niche", fontsize=16)
                plt.xlabel("Sales", fontsize=12)
                plt.tight_layout()
                
                top_products_path = f"{output_dir}/top_products_{timestamp}.png"
                plt.savefig(top_products_path, dpi=120, bbox_inches='tight')
                plt.close()
                results["graphs"]["topProducts"] = f"/temp/output/top_products_{timestamp}.png"
        
        # Generate BCG Matrix if we have both sales and profit margin
        if sales_col and profit_margin_col:
            # Calculate market share (relative to highest sales in category)
            df_bcg = df.groupby(category_col).agg({
                sales_col: 'sum',
                profit_margin_col: 'mean'
            }).reset_index()
            
            # Normalize market share relative to largest category
            df_bcg['relative_market_share'] = df_bcg[sales_col] / df_bcg[sales_col].max()
            
            # Create BCG Matrix
            plt.figure(figsize=(10, 8))
            plt.scatter(
                df_bcg['relative_market_share'], 
                df_bcg[profit_margin_col],
                s=df_bcg[sales_col] / df_bcg[sales_col].max() * 500,  # Size based on sales
                alpha=0.7,
                c=np.arange(len(df_bcg)),  # Color gradient
                cmap='viridis'
            )
            
            # Add labels for each point
            for i, row in df_bcg.iterrows():
                plt.annotate(
                    row[category_col], 
                    (row['relative_market_share'], row[profit_margin_col]),
                    xytext=(5, 5),
                    textcoords='offset points'
                )
            
            # Add quadrant lines
            plt.axvline(x=0.5, color='gray', linestyle='--', alpha=0.7)
            plt.axhline(y=df_bcg[profit_margin_col].median(), color='gray', linestyle='--', alpha=0.7)
            
            # Add quadrant labels
            plt.text(0.75, df_bcg[profit_margin_col].max() * 0.9, "STARS", fontsize=12, ha='center')
            plt.text(0.25, df_bcg[profit_margin_col].max() * 0.9, "QUESTION MARKS", fontsize=12, ha='center')
            plt.text(0.75, df_bcg[profit_margin_col].min() * 1.1, "CASH COWS", fontsize=12, ha='center')
            plt.text(0.25, df_bcg[profit_margin_col].min() * 1.1, "DOGS", fontsize=12, ha='center')
            
            plt.title("BCG Matrix - Market Share vs. Profit Margin", fontsize=16)
            plt.xlabel("Relative Market Share", fontsize=12)
            plt.ylabel("Profit Margin", fontsize=12)
            plt.tight_layout()
            
            bcg_path = f"{output_dir}/bcg_matrix_{timestamp}.png"
            plt.savefig(bcg_path, dpi=120, bbox_inches='tight')
            plt.close()
            results["graphs"]["bcgMatrix"] = f"/temp/output/bcg_matrix_{timestamp}.png"
            
            # Generate recommendations based on BCG matrix
            stars = df_bcg[(df_bcg['relative_market_share'] >= 0.5) & 
                           (df_bcg[profit_margin_col] >= df_bcg[profit_margin_col].median())][category_col].tolist()
            
            question_marks = df_bcg[(df_bcg['relative_market_share'] < 0.5) & 
                                   (df_bcg[profit_margin_col] >= df_bcg[profit_margin_col].median())][category_col].tolist()
            
            cash_cows = df_bcg[(df_bcg['relative_market_share'] >= 0.5) & 
                              (df_bcg[profit_margin_col] < df_bcg[profit_margin_col].median())][category_col].tolist()
            
            dogs = df_bcg[(df_bcg['relative_market_share'] < 0.5) & 
                         (df_bcg[profit_margin_col] < df_bcg[profit_margin_col].median())][category_col].tolist()
            
            recommendations = []
            
            if stars:
                recommendations.append(f"Invest in {stars[0]} - high growth and high market share make it a prime opportunity.")
            
            if question_marks:
                recommendations.append(f"Evaluate {question_marks[0]} - high growth potential but needs investment to increase market share.")
            
            if cash_cows:
                recommendations.append(f"Maintain {cash_cows[0]} - use the steady cash flow to fund growth in other areas.")
            
            if dogs:
                recommendations.append(f"Consider divesting from {dogs[0]} - low market share and low growth indicate poor prospects.")
            
            # Add general recommendations
            recommendations.append(f"Focus marketing efforts on {top_niches[0]} which shows the highest sales potential.")
            
            if len(top_niches) > 1:
                recommendations.append(f"Develop specialized product offerings for {top_niches[1]} to capture this growing niche.")
            
            results["recommendations"] = recommendations
            
            # Create a summary of the BCG matrix
            bcg_summary = {
                "stars": stars,
                "question_marks": question_marks,
                "cash_cows": cash_cows,
                "dogs": dogs
            }
            
            # Save BCG summary as JSON
            with open(f"{output_dir}/bcg_matrix_{timestamp}_summary.json", "w") as f:
                json.dump(bcg_summary, f)
        
        # Add graphUrl for frontend display
        if "salesByNiche" in results["graphs"]:
            results["graphUrl"] = f"http://localhost:8002{results['graphs']['salesByNiche']}"
        elif "bcgMatrix" in results["graphs"]:
            results["graphUrl"] = f"http://localhost:8002{results['graphs']['bcgMatrix']}"
        
        return results
    
    except Exception as e:
        print(f"Error in market analysis: {str(e)}")
        # Return basic results with error info
        return {
            "success": False,
            "error": str(e),
            "topNiches": ["Error in analysis"],
            "marketPotential": [],
            "recommendations": ["Could not analyze the data. Please check the file format."],
            "graphs": {}
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002) 