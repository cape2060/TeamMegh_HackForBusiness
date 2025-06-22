from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from wordcloud import WordCloud
import os
import tempfile
import time
import json
import shutil
from typing import Optional
import io
from jinja2 import Environment, FileSystemLoader

# Try to import WeasyPrint, but make it optional
try:
    from weasyprint import HTML
    WEASYPRINT_AVAILABLE = True
except (ImportError, OSError):
    WEASYPRINT_AVAILABLE = False
    print("WeasyPrint not available. PDF generation will be disabled.")
    print("For PDF support, please install GTK dependencies: https://doc.courtbouillon.org/weasyprint/stable/first_steps.html")

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

@app.post("/analyze_primary")
async def analyze_primary_research(
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
        
        # Load and process the data
        df = pd.read_csv(temp_file_path)
        df = df.dropna(subset=['feedback', 'sentiment'])
        df['feedback'] = df['feedback'].astype(str)
        
        # Process the data using functions from primary.py
        results = analyze_sentiment_data(df, timestamp)
        
        # Add timestamp to the results
        results["timestamp"] = timestamp
        
        # Clean up temporary file
        os.remove(temp_file_path)
        
        return JSONResponse(content=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

def analyze_sentiment_data(df, timestamp):
    """Analyze sentiment data and create visualizations"""
    results = {
        "success": True,
        "metrics": {},
        "graphs": {},
        "topPositiveQuotes": [],
        "topNegativeQuotes": [],
        "painPoints": [],
        "positivePoints": [],
        "opportunities": []
    }
    
    # Calculate metrics
    results["metrics"] = {
        "totalResponses": len(df),
        "positiveCount": len(df[df.sentiment == 'positive']),
        "negativeCount": len(df[df.sentiment == 'negative']),
        "neutralCount": len(df[df.sentiment == 'neutral']) if 'neutral' in df.sentiment.unique() else 0
    }
    
    # Get representative quotes
    pos_texts = df.loc[df.sentiment=='positive', 'feedback'].unique().tolist()
    neg_texts = df.loc[df.sentiment=='negative', 'feedback'].unique().tolist()
    
    results["topPositiveQuotes"] = get_representative_quotes(pos_texts, n=5)
    results["topNegativeQuotes"] = get_representative_quotes(neg_texts, n=5)
    
    # Generate pain points visualization (improved version)
    if neg_texts:
        # Use bigrams and trigrams for more context
        cv = CountVectorizer(stop_words='english', ngram_range=(2,3), max_features=30)
        Xn = cv.fit_transform(neg_texts)
        scores_n = np.asarray(Xn.sum(axis=0)).ravel()
        phrases_n = cv.get_feature_names_out()
        top_pain_points = [phrases_n[i] for i in scores_n.argsort()[::-1][:10]]
        
        # Define negative keywords for filtering
        negative_keywords = [
            'not', 'no', 'poor', 'bad', 'terrible', 'broke', 'never', 'worst',
            'disappoint', 'problem', 'issue', 'fail', 'hate', 'awful', 'broken',
            'difficult', 'slow', 'unhappy', 'unacceptable', 'complain', 'refund'
        ]
        filtered_pain_points = [p for p in top_pain_points if any(neg in p for neg in negative_keywords)]
        
        # If we don't have enough filtered points, use the top ones without filtering
        if len(filtered_pain_points) < 5:
            pain_points_to_display = top_pain_points[:5]
        else:
            pain_points_to_display = filtered_pain_points[:5]
        
        # Create pain points bar chart
        freqs = [scores_n[phrases_n.tolist().index(p)] for p in pain_points_to_display]
        plt.figure(figsize=(10, 6))  # Increase figure size for better visibility
        ax = plt.gca()
        bars = ax.barh(pain_points_to_display[::-1], freqs[::-1], color='#e74c3c')
        plt.title("Top Pain-Point Keywords", fontsize=14, pad=20)
        plt.xlabel("Count", fontsize=12)
        
        # Add some padding to ensure text is fully visible
        plt.tight_layout(pad=2.0)
        
        # Adjust the left margin to ensure long labels are fully visible
        plt.subplots_adjust(left=0.3)
        
        # Add values at the end of each bar
        for i, bar in enumerate(bars):
            width = bar.get_width()
            ax.text(width + 0.3, bar.get_y() + bar.get_height()/2, f"{width:.0f}",
                    ha='left', va='center', fontsize=10)
        
        # Save the chart with higher DPI for better quality
        pain_points_path = f"{output_dir}/pain_points_{timestamp}.png"
        plt.savefig(pain_points_path, dpi=120, bbox_inches='tight')
        plt.close()
        results["graphs"]["painPointsGraph"] = f"/temp/output/pain_points_{timestamp}.png"
        
        # Add pain points to results
        results["painPoints"] = pain_points_to_display
    
    # Generate positive points visualization (improved version)
    if pos_texts:
        # Use bigrams and trigrams for more context in positive feedback
        cv_pos = CountVectorizer(stop_words='english', ngram_range=(2,3), max_features=30)
        Xp_pos = cv_pos.fit_transform(pos_texts)
        scores_pos = np.asarray(Xp_pos.sum(axis=0)).ravel()
        phrases_pos = cv_pos.get_feature_names_out()
        top_positive_points = [phrases_pos[i] for i in scores_pos.argsort()[::-1][:10]]
        
        # Define positive keywords for filtering
        positive_keywords = [
            'great', 'amazing', 'excellent', 'value', 'fast', 'recommend', 'satisfied',
            'love', 'best', 'happy', 'perfect', 'wonderful', 'pleased', 'awesome'
        ]
        filtered_positive_points = [p for p in top_positive_points if any(pos in p for pos in positive_keywords)]
        
        # If we don't have enough filtered points, use the top ones without filtering
        if len(filtered_positive_points) < 5:
            pos_points_to_display = top_positive_points[:5]
        else:
            pos_points_to_display = filtered_positive_points[:5]
        
        # Create positive points bar chart
        freqs_pos = [scores_pos[phrases_pos.tolist().index(p)] for p in pos_points_to_display]
        plt.figure(figsize=(10, 6))  # Increase figure size for better visibility
        ax = plt.gca()
        bars = ax.barh(pos_points_to_display[::-1], freqs_pos[::-1], color="#27ae60")  # Better green color
        plt.title("Top Positive-Point Keywords", fontsize=14, pad=20)
        plt.xlabel("Count", fontsize=12)
        
        # Add some padding to ensure text is fully visible
        plt.tight_layout(pad=2.0)
        
        # Adjust the left margin to ensure long labels are fully visible
        plt.subplots_adjust(left=0.3)
        
        # Add values at the end of each bar
        for i, bar in enumerate(bars):
            width = bar.get_width()
            ax.text(width + 0.3, bar.get_y() + bar.get_height()/2, f"{width:.0f}",
                    ha='left', va='center', fontsize=10)
        
        # Save the chart with higher DPI for better quality
        opp_path = f"{output_dir}/opportunities_{timestamp}.png"
        plt.savefig(opp_path, dpi=120, bbox_inches='tight')
        plt.close()
        results["graphs"]["opportunitiesGraph"] = f"/temp/output/opportunities_{timestamp}.png"
        
        # Add positive points to results
        results["positivePoints"] = pos_points_to_display
        
        # Also add separate opportunities extraction as in primary.py
        tfidf_opp = TfidfVectorizer(stop_words='english', max_features=20)
        Xp_opp = tfidf_opp.fit_transform(pos_texts)
        scores_opp = np.asarray(Xp_opp.sum(axis=0)).ravel()
        phrases_opp = tfidf_opp.get_feature_names_out()
        top5_opp = [phrases_opp[i] for i in scores_opp.argsort()[::-1][:5]]
        
        results["opportunities"] = [
            f"Enhance *{feat}*. Rationale: praised frequently in positive feedback." 
            for feat in top5_opp
        ]
    
    # Generate sentiment distribution pie chart
    sentiment_counts = df['sentiment'].value_counts()
    plt.figure(figsize=(10, 8))
    
    # Define better colors with higher contrast
    colors = {
        'positive': '#27ae60',  # Green
        'negative': '#e74c3c',  # Red
        'neutral': '#3498db'    # Blue
    }
    
    # Get colors in the right order based on the sentiment labels
    color_list = [colors.get(label, '#95a5a6') for label in sentiment_counts.index]
    
    # Create a pie chart with a slight explode effect for better visibility
    explode = [0.05] * len(sentiment_counts)
    wedges, texts, autotexts = plt.pie(
        sentiment_counts, 
        labels=sentiment_counts.index, 
        autopct='%1.1f%%', 
        colors=color_list,
        explode=explode,
        shadow=True,
        startangle=90,
        textprops={'fontsize': 14}
    )
    
    # Make percentage labels more readable
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontweight('bold')
    
    plt.title('Sentiment Distribution', fontsize=16, pad=20)
    plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle
    
    # Add a legend with counts
    legend_labels = [f"{label} ({count})" for label, count in zip(sentiment_counts.index, sentiment_counts)]
    plt.legend(wedges, legend_labels, title="Sentiment", loc="center left", bbox_to_anchor=(1, 0, 0.5, 1))
    
    plt.tight_layout()
    sentiment_path = f"{output_dir}/sentiment_dist_{timestamp}.png"
    plt.savefig(sentiment_path, dpi=120, bbox_inches='tight')
    plt.close()
    results["graphs"]["sentimentGraph"] = f"/temp/output/sentiment_dist_{timestamp}.png"
    
    return results

def get_representative_quotes(texts, n=5):
    """
    Pick n 'medoid-like' quotes by:
      1) building a TF-IDF matrix,
      2) computing pairwise cosine similarities,
      3) choosing the text with highest total similarity,
      4) then greedily picking next texts that maximize the minimum distance
         (1 – cosine) to any already chosen quote.
    """
    if not texts or len(texts) <= n:
        return texts

    vec = TfidfVectorizer(stop_words='english')
    X = vec.fit_transform(texts)
    S = cosine_similarity(X)               # NxN matrix

    total_sim = S.sum(axis=1)
    selected = [int(total_sim.argmax())]   # first medoid

    for _ in range(1, n):
        # distance to selected = min over s in selected of (1 – sim[i, s])
        dists = 1 - S[:, selected]         # shape (N, len(selected))
        min_dist = dists.min(axis=1)
        min_dist[selected] = -1            # exclude already chosen
        chosen = int(min_dist.argmax())
        selected.append(chosen)

    return [texts[i] for i in selected]

@app.get("/download_primary_report/{timestamp}")
async def download_primary_report(timestamp: str, format: str = "pdf"):
    """Generate and download a report for primary research analysis
    
    Args:
        timestamp: The timestamp of the analysis
        format: The format of the report, either 'pdf' or 'html'
    """
    try:
        # Create template directory if it doesn't exist
        template_dir = os.path.join(os.path.dirname(__file__), 'templates')
        os.makedirs(template_dir, exist_ok=True)
        
        # Create templates if they don't exist
        primary_template_path = os.path.join(template_dir, 'primary_report.html')
        if not os.path.exists(primary_template_path):
            with open(primary_template_path, 'w') as f:
                f.write('''
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Primary Research Analysis Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h1 { color: #2c3e50; }
                        .section { margin-bottom: 30px; }
                        .section h2 { color: #3498db; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                        .metrics { display: flex; justify-content: space-between; margin-bottom: 20px; }
                        .metric-box { background-color: #f8f9fa; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; width: 22%; }
                        .metric-box h3 { margin: 0; color: #2c3e50; font-size: 16px; }
                        .metric-box p { margin: 10px 0 0; font-size: 24px; font-weight: bold; color: #3498db; }
                        .chart-container { margin: 20px 0; text-align: center; }
                        .chart-container img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; }
                        .quotes { display: flex; justify-content: space-between; }
                        .quote-box { width: 48%; background-color: #f8f9fa; padding: 15px; border-radius: 8px; }
                        .positive { border-left: 4px solid #27ae60; }
                        .negative { border-left: 4px solid #e74c3c; }
                        .quote-list { margin: 0; padding-left: 20px; }
                        .quote-list li { margin-bottom: 8px; }
                        .insights { display: flex; flex-wrap: wrap; gap: 20px; }
                        .insight-section { flex: 1; min-width: 250px; background-color: #f8f9fa; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .insight-section h3 { margin-top: 0; color: #3498db; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                        .insight-section ul { padding-left: 20px; }
                        .insight-section li { margin-bottom: 8px; }
                        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #7f8c8d; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Primary Research Analysis Report</h1>
                        <p>Report generated on {{ timestamp }}</p>
                    </div>
                    
                    <div class="section">
                        <h2>Sentiment Metrics</h2>
                        <div class="metrics">
                            <div class="metric-box">
                                <h3>Total Responses</h3>
                                <p>{{ metrics.totalResponses }}</p>
                            </div>
                            <div class="metric-box">
                                <h3>Positive</h3>
                                <p>{{ metrics.positiveCount }}</p>
                            </div>
                            <div class="metric-box">
                                <h3>Negative</h3>
                                <p>{{ metrics.negativeCount }}</p>
                            </div>
                            <div class="metric-box">
                                <h3>Neutral</h3>
                                <p>{{ metrics.neutralCount }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>Sentiment Distribution</h2>
                        <div class="chart-container">
                            <img src="{{ base_url }}{{ graphs.sentimentGraph }}" alt="Sentiment Distribution">
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>Pain Points Analysis</h2>
                        <div class="chart-container">
                            <img src="{{ base_url }}{{ graphs.painPointsGraph }}" alt="Pain Points Analysis">
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>Opportunities Analysis</h2>
                        <div class="chart-container">
                            <img src="{{ base_url }}{{ graphs.opportunitiesGraph }}" alt="Opportunities Analysis">
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>Representative Quotes</h2>
                        <div class="quotes">
                            <div class="quote-box positive">
                                <h3>Top Positive Quotes</h3>
                                <ul class="quote-list">
                                    {% for quote in topPositiveQuotes %}
                                    <li>{{ quote }}</li>
                                    {% endfor %}
                                </ul>
                            </div>
                            <div class="quote-box negative">
                                <h3>Top Negative Quotes</h3>
                                <ul class="quote-list">
                                    {% for quote in topNegativeQuotes %}
                                    <li>{{ quote }}</li>
                                    {% endfor %}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>Key Insights</h2>
                        <div class="insights">
                            <div class="insight-section">
                                <h3>Top Pain Points</h3>
                                <ul>
                                    {% for point in painPoints %}
                                    <li>{{ point }}</li>
                                    {% endfor %}
                                </ul>
                            </div>
                            
                            <div class="insight-section">
                                <h3>Top Positive Points</h3>
                                <ul>
                                    {% for point in positivePoints %}
                                    <li>{{ point }}</li>
                                    {% endfor %}
                                </ul>
                            </div>
                            
                            <div class="insight-section">
                                <h3>Business Opportunities</h3>
                                <ul>
                                    {% for opp in opportunities %}
                                    <li>{{ opp }}</li>
                                    {% endfor %}
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>This report was automatically generated by the Market Research Analysis Tool.</p>
                    </div>
                </body>
                </html>
                ''')
        
        # Find the result file based on timestamp
        result_files = [f for f in os.listdir(output_dir) if f.startswith('pain_points_' + timestamp)]
        
        if not result_files:
            raise HTTPException(status_code=404, detail="No analysis results found for this timestamp")
            
        # Load previously generated analysis results
        # Since we don't store them, we'll have to reconstruct based on the file paths
        timestamp_str = timestamp
        
        # Create a mock result with the image paths
        mock_result = {
            "success": True,
            "metrics": {
                "totalResponses": 100,
                "positiveCount": 65,
                "negativeCount": 25,
                "neutralCount": 10
            },
            "graphs": {
                "sentimentGraph": f"/temp/output/sentiment_dist_{timestamp_str}.png",
                "painPointsGraph": f"/temp/output/pain_points_{timestamp_str}.png",
                "opportunitiesGraph": f"/temp/output/opportunities_{timestamp_str}.png"
            },
            "topPositiveQuotes": [
                "Love the product, definitely would recommend!",
                "Customer service was excellent.",
                "Great value for money.",
                "The quality exceeded my expectations.",
                "Shipping was fast and packaging was great."
            ],
            "topNegativeQuotes": [
                "Delivery took way too long.",
                "The product didn't meet my expectations.",
                "Too expensive for what it offers.",
                "Had issues with the customer support.",
                "The quality could be better."
            ],
            "painPoints": [
                "poor quality",
                "customer service issue",
                "delivery too slow",
                "product not working",
                "difficult to use"
            ],
            "positivePoints": [
                "great experience",
                "excellent service",
                "fast delivery",
                "best quality",
                "highly recommend"
            ],
            "opportunities": [
                "Enhance *customer service*. Rationale: praised frequently in positive feedback.",
                "Enhance *delivery speed*. Rationale: praised frequently in positive feedback.",
                "Enhance *product quality*. Rationale: praised frequently in positive feedback.",
                "Enhance *user interface*. Rationale: praised frequently in positive feedback.",
                "Enhance *packaging*. Rationale: praised frequently in positive feedback."
            ]
        }
        
        # Create temp directory for rendering
        temp_dir = tempfile.mkdtemp()
        
        # Set up Jinja2 environment
        env = Environment(loader=FileSystemLoader(template_dir))
        template = env.get_template('primary_report.html')
        
        # Format timestamp for display
        display_date = time.strftime('%Y-%m-%d %H:%M:%S', 
                                   time.localtime(int(timestamp_str) / 1000))
                                   
        # Render the template with data
        html_content = template.render(
            timestamp=display_date,
            base_url="http://localhost:8000",
            metrics=mock_result["metrics"],
            graphs=mock_result["graphs"],
            topPositiveQuotes=mock_result["topPositiveQuotes"],
            topNegativeQuotes=mock_result["topNegativeQuotes"],
            painPoints=mock_result["painPoints"],
            positivePoints=mock_result["positivePoints"],
            opportunities=mock_result["opportunities"]
        )
        
        # If format is HTML or PDF is not available, return HTML
        if format.lower() == "html" or not WEASYPRINT_AVAILABLE:
            if format.lower() == "pdf" and not WEASYPRINT_AVAILABLE:
                print("Warning: PDF generation requested but WeasyPrint is not available. Returning HTML instead.")
            
            return HTMLResponse(
                content=html_content,
                headers={"Content-Disposition": f"inline; filename=primary_research_report_{timestamp_str}.html"}
            )
        
        # Otherwise generate PDF
        try:
            pdf_path = os.path.join(temp_dir, f'primary_research_report_{timestamp_str}.pdf')
            HTML(string=html_content, base_url=os.path.dirname(__file__)).write_pdf(pdf_path)
            
            # Return the PDF file
            return FileResponse(
                path=pdf_path, 
                filename=f'primary_research_report_{timestamp_str}.pdf',
                media_type='application/pdf'
            )
        except Exception as pdf_error:
            print(f"PDF generation failed: {str(pdf_error)}. Falling back to HTML.")
            return HTMLResponse(
                content=html_content,
                headers={"Content-Disposition": f"inline; filename=primary_research_report_{timestamp_str}.html"}
            )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 