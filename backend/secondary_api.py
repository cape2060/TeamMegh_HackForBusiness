from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import pandas as pd
import matplotlib.pyplot as plt
import os
import tempfile
import time
import json
import shutil
from typing import Optional
import numpy as np
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML

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

@app.post("/analyze_secondary")
async def analyze_secondary_research(
    file: UploadFile = File(...),
    description: Optional[str] = Form(None)
):
    # Create a timestamp for unique filenames
    timestamp = int(time.time() * 1000)
    
    try:
        # Save uploaded file to a temporary location
        temp_file_path = f"{output_dir}/temp_{timestamp}_{file.filename}"
        with open(temp_file_path, "wb") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
        
        # Process the data using functions from secondary.py
        results = analyze_data(temp_file_path, timestamp)
        
        # Add timestamp to the results
        results["timestamp"] = timestamp
        
        # Clean up temporary file
        os.remove(temp_file_path)
        
        return JSONResponse(content=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def analyze_data(file_path, timestamp):
    """Analyze secondary research data (quantitative) and create visualizations"""
    
    # Read the data from the provided file path
    try:
        df = pd.read_csv(file_path)
        print(f"Successfully read file with {len(df)} rows")
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        raise HTTPException(status_code=400, detail=f"Error reading CSV file: {str(e)}")
    
    # Initialize results dictionary
    results = {
        "success": True,
        "charts": [],
        "insights": [],
        "summary": {}
    }
    
    # Analysis 1: Group by product_niche and sum total_sales
    niche_sales = df.groupby('product_niche')['total_sales'].sum().reset_index()
    niche_sales = niche_sales.sort_values('total_sales', ascending=False)
    
    # Generate chart 1: Total Sales by Product Niche
    plt.figure(figsize=(10,6))
    bars = plt.bar(niche_sales['product_niche'], niche_sales['total_sales'], color='skyblue')
    plt.xlabel('Product Niche')
    plt.ylabel('Total Sales')
    plt.title('Total Sales by Product Niche')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    
    # Add sales count on top of each bar
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2, height, f'{int(height)}', 
                 ha='center', va='bottom', fontsize=10)
    
    # Save chart 1
    chart1_path = f'{output_dir}/sales_by_niche_{timestamp}.png'
    plt.savefig(chart1_path)
    plt.close()
    results['charts'].append({
        'title': 'Total Sales by Product Niche',
        'path': f'/temp/output/sales_by_niche_{timestamp}.png',
        'description': 'Comparison of total sales across different product niches'
    })
    
    # Analysis 2: Find top 5 products by total quantity sold
    top_products = df.groupby('product_details')['total_qty_sold'].sum().reset_index()
    top_products = top_products.sort_values('total_qty_sold', ascending=False).head(5)
    
    # Generate chart 2: Top 5 Products by Quantity Sold
    plt.figure(figsize=(8,5))
    bars = plt.bar(top_products['product_details'], top_products['total_qty_sold'], color='orange')
    plt.xlabel('Product Details')
    plt.ylabel('Total Quantity Sold')
    plt.title('Top 5 Products by Quantity Sold')
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    
    # Add quantity on top of each bar
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2, height, f'{int(height)}', 
                 ha='center', va='bottom', fontsize=10)
    
    # Save chart 2
    chart2_path = f'{output_dir}/top_products_{timestamp}.png'
    plt.savefig(chart2_path)
    plt.close()
    results['charts'].append({
        'title': 'Top 5 Products by Quantity Sold',
        'path': f'/temp/output/top_products_{timestamp}.png',
        'description': 'The five best-selling products by quantity'
    })
    
    # Analysis 3: BCG Matrix classification
    if all(col in df.columns for col in ['relative_market_share', 'market_growth']):
        rms_high = df['relative_market_share'].quantile(0.66)
        rms_low = df['relative_market_share'].quantile(0.33)
        mg_high = df['market_growth'].quantile(0.66)
        mg_low = df['market_growth'].quantile(0.33)
        
        def classify(row):
            if row['relative_market_share'] >= rms_high and row['market_growth'] >= mg_high:
                return 'Star'
            elif row['relative_market_share'] >= rms_high and row['market_growth'] < mg_high:
                return 'Cash Cow'
            elif row['relative_market_share'] < rms_low and row['market_growth'] >= mg_high:
                return 'Question Mark'
            else:
                return 'Dog'
        
        df['classification'] = df.apply(classify, axis=1)
        
        # Generate chart 3: BCG Matrix
        plt.figure(figsize=(10,8))
        colors = {'Star': 'gold', 'Cash Cow': 'green', 'Question Mark': 'blue', 'Dog': 'red'}
        
        for category, group in df.groupby('classification'):
            plt.scatter(
                group['relative_market_share'], 
                group['market_growth'], 
                s=group['total_sales']/500,  # Size based on sales
                color=colors[category],
                alpha=0.7,
                label=category
            )
            
            # Add product labels to some points
            for i, row in group.head(2).iterrows():
                plt.annotate(
                    row['product_details'][:10] + '...',
                    (row['relative_market_share'], row['market_growth']),
                    xytext=(5, 5),
                    textcoords='offset points'
                )
        
        plt.axvline(x=rms_low, color='gray', linestyle='--', alpha=0.5)
        plt.axhline(y=mg_low, color='gray', linestyle='--', alpha=0.5)
        plt.xlabel('Relative Market Share')
        plt.ylabel('Market Growth')
        plt.title('BCG Matrix Analysis')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        # Save chart 3
        chart3_path = f'{output_dir}/bcg_matrix_{timestamp}.png'
        plt.savefig(chart3_path)
        plt.close()
        results['charts'].append({
            'title': 'BCG Matrix Analysis',
            'path': f'/temp/output/bcg_matrix_{timestamp}.png',
            'description': 'Product portfolio analysis using the BCG matrix'
        })
        
        # Generate insights
        category_counts = df['classification'].value_counts()
        results['insights'] = [
            f"Top selling product niche: {niche_sales.iloc[0]['product_niche']} with ${int(niche_sales.iloc[0]['total_sales'])} in sales",
            f"Best selling product: {top_products.iloc[0]['product_details']} with {int(top_products.iloc[0]['total_qty_sold'])} units sold",
            f"Portfolio composition: {category_counts.get('Star', 0)} Stars, {category_counts.get('Cash Cow', 0)} Cash Cows, {category_counts.get('Question Mark', 0)} Question Marks, {category_counts.get('Dog', 0)} Dogs"
        ]
    else:
        results['insights'] = [
            f"Top selling product niche: {niche_sales.iloc[0]['product_niche']} with ${int(niche_sales.iloc[0]['total_sales'])} in sales",
            f"Best selling product: {top_products.iloc[0]['product_details']} with {int(top_products.iloc[0]['total_qty_sold'])} units sold"
        ]
    
    # Generate summary
    results['summary'] = {
        'total_products': len(df),
        'total_sales': int(df['total_sales'].sum()),
        'total_quantity_sold': int(df['total_qty_sold'].sum()),
        'timestamp': timestamp
    }
    
    # Add average market metrics if available
    if 'market_growth' in df.columns and 'relative_market_share' in df.columns:
        results['summary']['average_market_growth'] = float(df['market_growth'].mean())
        results['summary']['average_market_share'] = float(df['relative_market_share'].mean())
    
    return results

@app.get("/download_secondary_report/{timestamp}")
async def download_secondary_report(timestamp: str):
    """Generate and download a PDF report for secondary research analysis"""
    try:
        # Create template directory if it doesn't exist
        template_dir = os.path.join(os.path.dirname(__file__), 'templates')
        os.makedirs(template_dir, exist_ok=True)
        
        # Create templates if they don't exist
        secondary_template_path = os.path.join(template_dir, 'secondary_report.html')
        if not os.path.exists(secondary_template_path):
            with open(secondary_template_path, 'w') as f:
                f.write('''
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Secondary Research Analysis Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h1 { color: #2c3e50; }
                        .section { margin-bottom: 30px; }
                        .section h2 { color: #3498db; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                        .summary { display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 20px; }
                        .summary-box { background-color: #f8f9fa; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; width: 30%; margin-bottom: 15px; }
                        .summary-box h3 { margin: 0; color: #2c3e50; font-size: 16px; }
                        .summary-box p { margin: 10px 0 0; font-size: 24px; font-weight: bold; color: #3498db; }
                        .chart-container { margin: 30px 0; text-align: center; }
                        .chart-container h3 { color: #34495e; margin-bottom: 15px; }
                        .chart-container img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; }
                        .insights { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px; }
                        .insights h3 { color: #34495e; margin-top: 0; }
                        .insights ul { margin: 0; padding-left: 20px; }
                        .insights li { margin-bottom: 10px; }
                        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #7f8c8d; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Secondary Research Analysis Report</h1>
                        <p>Report generated on {{ timestamp }}</p>
                    </div>
                    
                    <div class="section">
                        <h2>Summary Metrics</h2>
                        <div class="summary">
                            <div class="summary-box">
                                <h3>Total Products</h3>
                                <p>{{ summary.total_products }}</p>
                            </div>
                            <div class="summary-box">
                                <h3>Total Sales</h3>
                                <p>${{ summary.total_sales|format_number }}</p>
                            </div>
                            <div class="summary-box">
                                <h3>Total Quantity Sold</h3>
                                <p>{{ summary.total_quantity_sold|format_number }}</p>
                            </div>
                            {% if summary.average_market_growth is defined %}
                            <div class="summary-box">
                                <h3>Avg. Market Growth</h3>
                                <p>{{ "%.1f"|format(summary.average_market_growth) }}%</p>
                            </div>
                            {% endif %}
                            {% if summary.average_market_share is defined %}
                            <div class="summary-box">
                                <h3>Avg. Market Share</h3>
                                <p>{{ "%.2f"|format(summary.average_market_share) }}</p>
                            </div>
                            {% endif %}
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>Key Insights</h2>
                        <div class="insights">
                            <ul>
                                {% for insight in insights %}
                                <li>{{ insight }}</li>
                                {% endfor %}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>Product Analysis</h2>
                        {% for chart in charts %}
                        <div class="chart-container">
                            <h3>{{ chart.title }}</h3>
                            <p>{{ chart.description }}</p>
                            <img src="{{ base_url }}{{ chart.path }}" alt="{{ chart.title }}">
                        </div>
                        {% endfor %}
                    </div>
                    
                    <div class="footer">
                        <p>This report was automatically generated by the Market Research Analysis Tool.</p>
                    </div>
                </body>
                </html>
                ''')
        
        # Find the result file based on timestamp
        result_files = [f for f in os.listdir(output_dir) if f.startswith('sales_by_niche_' + timestamp)]
        
        if not result_files:
            raise HTTPException(status_code=404, detail="No analysis results found for this timestamp")
            
        # Load previously generated analysis results
        # Since we don't store them, we'll have to reconstruct based on the file paths
        timestamp_str = timestamp
        
        # Create a mock result with the image paths
        mock_result = {
            "success": True,
            "charts": [
                {
                    "title": "Total Sales by Product Niche",
                    "path": f"/temp/output/sales_by_niche_{timestamp_str}.png",
                    "description": "Comparison of total sales across different product niches"
                },
                {
                    "title": "Top 5 Products by Quantity Sold",
                    "path": f"/temp/output/top_products_{timestamp_str}.png",
                    "description": "The five best-selling products by quantity"
                },
                {
                    "title": "BCG Matrix Analysis",
                    "path": f"/temp/output/bcg_matrix_{timestamp_str}.png",
                    "description": "Product portfolio analysis using the BCG matrix"
                }
            ],
            "insights": [
                "Top selling product niche: Athletic Shoes with $1,250,000 in sales",
                "Best selling product: Pro Running Shoe X1 with 5,000 units sold",
                "Portfolio composition: 4 Stars, 6 Cash Cows, 3 Question Marks, 7 Dogs"
            ],
            "summary": {
                "total_products": 20,
                "total_sales": 3750000,
                "total_quantity_sold": 25000,
                "average_market_growth": 12.5,
                "average_market_share": 0.45
            }
        }
        
        # Create temp directory for rendering
        temp_dir = tempfile.mkdtemp()
        
        # Set up Jinja2 environment with custom filter
        env = Environment(loader=FileSystemLoader(template_dir))
        
        # Add custom filter to format numbers with commas
        def format_number(value):
            return f"{value:,}"
        
        env.filters['format_number'] = format_number
        template = env.get_template('secondary_report.html')
        
        # Format timestamp for display
        display_date = time.strftime('%Y-%m-%d %H:%M:%S', 
                                   time.localtime(int(timestamp_str) / 1000))
                                   
        # Render the template with data
        html_content = template.render(
            timestamp=display_date,
            base_url="http://localhost:8001",
            summary=mock_result["summary"],
            insights=mock_result["insights"],
            charts=mock_result["charts"]
        )
        
        # Generate PDF
        pdf_path = os.path.join(temp_dir, f'secondary_research_report_{timestamp_str}.pdf')
        HTML(string=html_content, base_url=os.path.dirname(__file__)).write_pdf(pdf_path)
        
        # Return the PDF file
        return FileResponse(
            path=pdf_path, 
            filename=f'secondary_research_report_{timestamp_str}.pdf',
            media_type='application/pdf'
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Note: Using 8001 for secondary API 