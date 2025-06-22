@echo off
echo Starting all FastAPI servers for research analysis...
echo Make sure you have installed the required dependencies with:
echo pip install -r requirements.txt

echo.
echo Starting Primary Research API server on port 8000...
start cmd /k python primary_api.py

echo.
echo Starting Secondary Research API server on port 8001...
start cmd /k python secondary_api.py

echo.
echo All FastAPI servers started. You can access:
echo Primary Research API: http://localhost:8000/docs
echo Secondary Research API: http://localhost:8001/docs 