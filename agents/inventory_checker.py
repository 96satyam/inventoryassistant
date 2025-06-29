import pandas as pd
from typing import Dict
from libs.core.schemas import DocumentExtractionResult
import os
import time
from datetime import datetime
import threading
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
INVENTORY_FILE = PROJECT_ROOT / "solar_installer_ai"/"data" / "Inventry.xlsx" 


class RealTimeInventoryAgent:
    def __init__(self, inventory_file: str = INVENTORY_FILE, check_interval: int = 5):
        self.inventory_file = inventory_file
        self.check_interval = check_interval
        self.current_data = None
        self.last_modified = None
        self.is_monitoring = False
        self.callbacks = []
        
        # Load initial data
        self.reload_data()
    
    def reload_data(self) -> bool:
        """Reload Excel data if file has changed"""
        try:
            if not os.path.exists(self.inventory_file):
                print(f"Warning: {self.inventory_file} not found")
                return False
            
            current_modified = os.path.getmtime(self.inventory_file)
            
            if self.last_modified != current_modified:
                print(f"[{datetime.now().strftime('%H:%M:%S')}] 📊 Inventory updated - reloading data")
                
                old_data = self.current_data
                self.current_data = pd.read_excel(self.inventory_file)
                self.last_modified = current_modified
                
                # Trigger callbacks
                for callback in self.callbacks:
                    try:
                        callback(self.current_data, old_data)
                    except Exception as e:
                        print(f"Error in callback: {e}")
                
                return True
            return False
        except Exception as e:
            print(f"Error reloading inventory: {e}")
            return False
    
    def start_monitoring(self):
        """Start background monitoring"""
        if self.is_monitoring:
            return
        
        self.is_monitoring = True
        
        def monitor_loop():
            while self.is_monitoring:
                self.reload_data()
                time.sleep(self.check_interval)
        
        self.monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
        self.monitor_thread.start()
        print(f"🔍 Started monitoring {self.inventory_file} every {self.check_interval} seconds")
    
    def stop_monitoring(self):
        """Stop monitoring"""
        self.is_monitoring = False
        print("⏹️  Stopped inventory monitoring")
    
    def add_change_listener(self, callback):
        """Add callback for when inventory changes"""
        self.callbacks.append(callback)
    
    def normalize(self, text: str) -> str:
        """Normalize text for comparison"""
        return str(text).lower().strip().replace(" ", "").replace("-", "")
    
    def check_inventory(self, requirements: DocumentExtractionResult) -> Dict[str, int]:
        """Check inventory against requirements with real-time data"""
        # Ensure we have the latest data
        self.reload_data()
        
        if self.current_data is None:
            return {"Error": "No inventory data available"}
        
        df = self.current_data.copy()
        shortfall = {}

        def find_shortfall_with_qty(qty_col, model_col, required_model, required_qty):
            if not required_model or required_qty <= 0:
                return

            norm_required = self.normalize(required_model)
            df["norm_model"] = df[model_col].astype(str).apply(self.normalize)

            matches = df[df["norm_model"] == norm_required]
            if matches.empty:
                shortfall[required_model] = required_qty
            else:
                available = int(matches.iloc[0][qty_col])
                if required_qty > available:
                    shortfall[required_model] = required_qty - available

        def find_shortfall_model_only(model_col, required_model, required_qty):
            if not required_model or required_qty <= 0:
                return

            norm_required = self.normalize(required_model)
            df["norm_model"] = df[model_col].astype(str).apply(self.normalize)

            matches = df[df["norm_model"] == norm_required]
            if matches.empty:
                shortfall[required_model] = required_qty
            else:
                available_rows = len(matches)
                if required_qty > available_rows:
                    shortfall[required_model] = required_qty - available_rows

        # Check modules
        find_shortfall_with_qty("No. Of Modules", "Module Company", 
                               requirements.modules.model, requirements.modules.quantity)
        
        # Check optimizers
        if requirements.optimizer:
            find_shortfall_with_qty("No. of Optimizers", "Optimizers Company", 
                                   requirements.optimizer.model, requirements.optimizer.quantity)
        
        # Check battery
        if requirements.battery:
            find_shortfall_model_only("Battery Company", 
                                     requirements.battery.model, requirements.battery.quantity)
        
        # Check inverter
        if requirements.inverter:
            find_shortfall_model_only("Inverter Company", 
                                     requirements.inverter.model, requirements.inverter.quantity)

        return shortfall
    
    def get_inventory_summary(self) -> Dict:
        """Get current inventory summary"""
        if self.current_data is None:
            return {}
        
        df = self.current_data
        return {
            "total_modules": int(df["No. Of Modules"].fillna(0).sum()),
            "total_optimizers": int(df["No. of Optimizers"].fillna(0).sum()),
            "unique_module_types": df["Module Company"].dropna().nunique(),
            "unique_battery_types": df["Battery Company"].dropna().nunique(),
            "unique_inverter_types": df["Inverter Company"].dropna().nunique(),
            "low_stock_modules": len(df[df["No. Of Modules"].fillna(0) < 5]),
            "last_updated": datetime.fromtimestamp(self.last_modified).strftime('%Y-%m-%d %H:%M:%S') if self.last_modified else "Never"
        }

# Create global instance
inventory_agent = RealTimeInventoryAgent()

# Updated function for backward compatibility
def check_inventory(requirements: DocumentExtractionResult) -> Dict[str, int]:
    """Backward compatible function that uses real-time data"""
    return inventory_agent.check_inventory(requirements)

# Setup alerts
def setup_inventory_alerts():
    """Setup automated alerts for inventory changes"""
    
    def low_stock_alert(new_data, old_data):
        # Check for low stock
        low_stock = new_data[new_data["No. Of Modules"].fillna(0) < 5]
        if not low_stock.empty:
            print("⚠️  LOW STOCK ALERT!")
            for _, row in low_stock.iterrows():
                print(f"   📦 {row['Module Company']}: {row['No. Of Modules']} remaining")
    
    def inventory_change_alert(new_data, old_data):
        if old_data is not None:
            # Check for quantity changes
            if len(new_data) != len(old_data):
                print(f"📈 Inventory size changed: {len(old_data)} → {len(new_data)} items")
            
            # Check for module quantity changes
            for idx, row in new_data.iterrows():
                if idx < len(old_data):
                    old_qty = old_data.iloc[idx]["No. Of Modules"]
                    new_qty = row["No. Of Modules"]
                    if old_qty != new_qty:
                        company = row["Module Company"]
                        change = new_qty - old_qty
                        symbol = "📈" if change > 0 else "📉"
                        print(f"{symbol} {company}: {old_qty} → {new_qty} ({change:+d})")
    
    inventory_agent.add_change_listener(low_stock_alert)
    inventory_agent.add_change_listener(inventory_change_alert)

# Auto-start monitoring when imported
if __name__ != "__main__":
    setup_inventory_alerts()
    inventory_agent.start_monitoring()

# Example usage
if __name__ == "__main__":
    # Setup alerts
    setup_inventory_alerts()
    
    # Start monitoring
    inventory_agent.start_monitoring()
    
    print("🚀 Real-time inventory monitoring started!")
    print(f"📊 Current inventory: {inventory_agent.get_inventory_summary()}")
    print("💡 Modify your Excel file to see real-time updates...")
    print("Press Ctrl+C to stop\n")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        inventory_agent.stop_monitoring()
        print("\n👋 Monitoring stopped")