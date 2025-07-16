"""
Data Scraper Scheduler
Professional scheduling system for daily data scraping at 9:00 AM
"""

import schedule
import time
import logging
from datetime import datetime
from pathlib import Path

from .scraper import run_daily_scrape
from .config import SCRAPER_CONFIG, LOG_FILES


class DataScraperScheduler:
    """Professional scheduler for daily data scraping"""
    
    def __init__(self):
        self.setup_logging()
        self.schedule_time = SCRAPER_CONFIG["schedule_time"]
        self.is_running = False
        
    def setup_logging(self):
        """Configure logging for the scheduler"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(LOG_FILES["scraper"]),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def scheduled_scrape_job(self):
        """Job function that runs the daily scrape"""
        self.logger.info(f"⏰ Scheduled scrape started at {datetime.now()}")
        
        try:
            success = run_daily_scrape()
            if success:
                self.logger.info("✅ Scheduled scrape completed successfully")
            else:
                self.logger.error("❌ Scheduled scrape failed")
                
        except Exception as e:
            self.logger.error(f"❌ Scheduled scrape error: {e}")
    
    def start_scheduler(self):
        """Start the daily scheduler"""
        if self.is_running:
            self.logger.warning("⚠️ Scheduler is already running")
            return
        
        # Schedule daily scrape at specified time
        schedule.every().day.at(self.schedule_time).do(self.scheduled_scrape_job)
        
        self.is_running = True
        self.logger.info(f"📅 Scheduler started - Daily scrape at {self.schedule_time}")
        self.logger.info(f"🕘 Next scrape: {schedule.next_run()}")
        
        try:
            while self.is_running:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
                
        except KeyboardInterrupt:
            self.logger.info("⏹️ Scheduler stopped by user")
            self.is_running = False
        except Exception as e:
            self.logger.error(f"❌ Scheduler error: {e}")
            self.is_running = False
    
    def stop_scheduler(self):
        """Stop the scheduler"""
        self.is_running = False
        schedule.clear()
        self.logger.info("⏹️ Scheduler stopped")
    
    def run_manual_scrape(self):
        """Run a manual scrape immediately"""
        self.logger.info("🔧 Running manual scrape")
        return self.scheduled_scrape_job()
    
    def get_next_run_time(self):
        """Get the next scheduled run time"""
        return schedule.next_run()
    
    def get_scheduler_status(self):
        """Get scheduler status information"""
        return {
            "is_running": self.is_running,
            "schedule_time": self.schedule_time,
            "next_run": str(schedule.next_run()) if schedule.jobs else "Not scheduled",
            "jobs_count": len(schedule.jobs)
        }


# Standalone functions for external use
def start_daily_scheduler():
    """Start the daily scheduler - can be called from external scripts"""
    scheduler = DataScraperScheduler()
    scheduler.start_scheduler()


def run_manual_scrape():
    """Run a manual scrape immediately"""
    scheduler = DataScraperScheduler()
    return scheduler.run_manual_scrape()


if __name__ == "__main__":
    # For running the scheduler directly
    print("🤖 Starting Data Scraper Scheduler")
    print(f"📅 Daily scrape scheduled for {SCRAPER_CONFIG['schedule_time']}")
    print("Press Ctrl+C to stop")
    
    start_daily_scheduler()
