@echo off
REM Daily Data Scraper for Solar Installer AI
REM This script runs the daily data scraper to update cached CSV files

echo ========================================
echo Solar Installer AI - Daily Data Scraper
echo ========================================
echo Starting at %date% %time%

REM Change to project directory
cd /d "%~dp0\.."

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Run the data scraper
echo Running data scraper...
python scripts\run_data_scraper.py scrape

REM Check exit code
if %ERRORLEVEL% EQU 0 (
    echo ✅ Data scraper completed successfully
) else (
    echo ❌ Data scraper failed with error code %ERRORLEVEL%
)

echo Completed at %date% %time%
echo ========================================

REM Keep window open for 5 seconds to see results
timeout /t 5 /nobreak > nul
