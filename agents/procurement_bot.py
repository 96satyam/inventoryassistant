import yagmail
import os
import logging
from jinja2 import Environment, FileSystemLoader, TemplateNotFound
from typing import Dict, Optional
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
EMAIL_TEMPLATE = "email_templates/order_request.html"
SUPPLIER_EMAIL = "satyam1@wattmonk.com"  # replace with real
TEMPLATE_DIR = "."

class ProcurementEmailer:
    """Handles procurement email sending with proper error handling and resource management."""
    
    def __init__(self, template_dir: str = TEMPLATE_DIR, template_name: str = EMAIL_TEMPLATE):
        self.template_dir = template_dir
        self.template_name = template_name
        self._jinja_env = None
        self._validate_environment()
    
    def _validate_environment(self) -> None:
        """Validate required environment variables and template existence."""
        required_env_vars = ["MAIL_USER", "MAIL_PASS"]
        missing_vars = [var for var in required_env_vars if not os.getenv(var)]
        
        if missing_vars:
            logger.error(f"Missing required environment variables: {missing_vars}")
            logger.info("Create a .env file with:")
            logger.info("MAIL_USER=yourgmail@gmail.com")
            logger.info("MAIL_PASS=your-app-password")
            raise ValueError(f"Missing required environment variables: {missing_vars}")
        
        # Check if template exists (warn but don't fail)
        template_path = Path(self.template_dir) / self.template_name
        if not template_path.exists():
            logger.warning(f"Email template not found: {template_path} - will use simple HTML")
    
    @property
    def jinja_env(self) -> Environment:
        """Lazy-load Jinja environment."""
        if self._jinja_env is None:
            self._jinja_env = Environment(
                loader=FileSystemLoader(self.template_dir),
                autoescape=True  # Security: auto-escape HTML
            )
        return self._jinja_env
    
    def _render_template(self, shortfall: Dict[str, int]) -> str:
        """Render email template with shortfall data."""
        try:
            template = self.jinja_env.get_template(self.template_name)
            return template.render(
                shortfall=shortfall,
                date=datetime.now().strftime("%Y-%m-%d"),
                total_items=len(shortfall),
                total_quantity=sum(shortfall.values())
            )
        except TemplateNotFound:
            logger.warning(f"Template {self.template_name} not found, using simple HTML")
            return self._create_simple_html(shortfall)
        except Exception as e:
            logger.error(f"Template rendering failed: {e}")
            return self._create_simple_html(shortfall)
    
    def _create_simple_html(self, shortfall: Dict[str, int]) -> str:
        """Create simple HTML email when template is not available."""
        html = f"""
        <html>
        <body>
            <h2>🏭 Procurement Request</h2>
            <p><strong>Date:</strong> {datetime.now().strftime('%Y-%m-%d')}</p>
            <p><strong>Total Items:</strong> {len(shortfall)}</p>
            <p><strong>Total Quantity:</strong> {sum(shortfall.values())}</p>
            
            <h3>Equipment Shortfall:</h3>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <tr style="background-color: #f2f2f2;">
                    <th style="padding: 8px; text-align: left;">Item</th>
                    <th style="padding: 8px; text-align: right;">Quantity Needed</th>
                </tr>
        """
        
        for item, qty in shortfall.items():
            html += f"""
                <tr>
                    <td style="padding: 8px;">{item}</td>
                    <td style="padding: 8px; text-align: right;">{qty}</td>
                </tr>
            """
        
        html += """
            </table>
            <br>
            <p>Please arrange for procurement of the above items.</p>
            <p><em>This is an automated procurement request.</em></p>
        </body>
        </html>
        """
        return html
    
    def send_procurement_email(
        self, 
        shortfall: Dict[str, int], 
        recipient: Optional[str] = None,
        subject_prefix: str = "Procurement Request"
    ) -> bool:
        """
        Send procurement email for equipment shortfall.
        
        Args:
            shortfall: Dictionary mapping item names to quantities needed
            recipient: Email recipient (defaults to SUPPLIER_EMAIL)
            subject_prefix: Subject line prefix
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        if not shortfall:
            logger.info("✅ No shortfalls detected. No email sent.")
            return True
        
        recipient = recipient or SUPPLIER_EMAIL
        
        try:
            # Render email content
            html_content = self._render_template(shortfall)
            subject = f"{subject_prefix}: Equipment Shortfall ({len(shortfall)} items)"
            
            logger.info(f"📤 Sending procurement email to {recipient}")
            logger.info(f"📊 Items: {len(shortfall)}, Total quantity: {sum(shortfall.values())}")
            
            # Send email using the working yagmail pattern
            yag = yagmail.SMTP(
                user=os.getenv("MAIL_USER"), 
                password=os.getenv("MAIL_PASS")
            )
            
            yag.send(
                to=recipient, 
                subject=subject, 
                contents=html_content
            )
            
            # Close connection
            yag.close()
            
            logger.info(f"✅ Procurement email sent successfully to {recipient}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send procurement email: {e}")
            logger.error(f"Error type: {type(e).__name__}")
            return False

# Convenience function for backward compatibility
def send_procurement_email(shortfall: Dict[str, int]) -> bool:
    """
    Send procurement email for equipment shortfall.
    
    Args:
        shortfall: Dictionary mapping item names to quantities needed
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        emailer = ProcurementEmailer()
        return emailer.send_procurement_email(shortfall)
    except Exception as e:
        logger.error(f"❌ Email sending failed: {e}")
        return False

# Test function
def test_email():
    """Test the email functionality."""
    sample_shortfall = {
        "Solar Panel 300W": 25,
        "Inverter 5kW": 5,
        "Battery 100Ah": 10
    }
    
    logger.info("🧪 Testing procurement email...")
    success = send_procurement_email(sample_shortfall)
    
    if success:
        logger.info("✅ Test completed successfully")
    else:
        logger.error("❌ Test failed")
    
    return success

# Example usage
if __name__ == "__main__":
    # Test email functionality
    print("🧪 Testing procurement email system...")
    
    # Check if environment variables are loaded
    if not os.getenv("MAIL_USER") or not os.getenv("MAIL_PASS"):
        print("❌ Email credentials not found in environment!")
        print("Make sure your .env file contains:")
        print("MAIL_USER=yourgmail@gmail.com")
        print("MAIL_PASS=your-app-password")
        exit(1)
    
    print(f"📧 Email configured for: {os.getenv('MAIL_USER')}")
    
    # Run test
    test_email()