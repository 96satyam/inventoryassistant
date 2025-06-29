# app_streamlit.py

import streamlit as st
from libs.core.graph import build_pipeline  
import os

# Config
TEMP_FILE_PATH = "temp_upload.pdf"
st.set_page_config(page_title="Solar Installer AI", layout="wide")
st.title("🔧 Solar Installation Intelligence")

# File uploader
uploaded_file = st.file_uploader("Upload your PDF planset", type=["pdf"])

if uploaded_file:
    try:
        # Save uploaded file
        with open(TEMP_FILE_PATH, "wb") as f:
            content = uploaded_file.read()
            st.write(f"Saved {len(content)} bytes")
            f.write(content)

        # Verify file exists and is readable
        if not os.path.exists(TEMP_FILE_PATH):
            raise FileNotFoundError(f"Failed to save file to {TEMP_FILE_PATH}")
        
        st.info(f"File saved successfully: {TEMP_FILE_PATH}")

        # Run LangGraph pipeline with simple state structure
        pipeline = build_pipeline()
        
        # Create simple initial state
        initial_state = {"pdf_path": TEMP_FILE_PATH}
        
        st.info("Starting pipeline...")
        st.write(f"Initial state: {initial_state}")
        
        result = pipeline.invoke(initial_state)
        
        st.success("✅ Pipeline completed successfully!")

        # Display extracted equipment
        with st.expander("📄 Extracted Equipment"):
            extracted = result.get("extracted")
            if extracted:
                if hasattr(extracted, 'model_dump'):
                    st.json(extracted.model_dump())
                else:
                    st.write(extracted)
            else:
                st.warning("No equipment data extracted.")

        # Display inventory shortfall
        with st.expander("📦 Inventory Shortfall"):
            shortfall = result.get("shortfall")
            if shortfall:
                st.write(shortfall)
            else:
                st.success("No shortfalls 🎉")

        # Show email action
        with st.expander("📧 Procurement Email Status"):
            if result.get("email_sent"):
                st.success("✅ Email sent for procurement.")
            elif result.get("shortfall"):
                st.warning("⚠️ Shortfall detected but email may have failed.")
            else:
                st.info("No procurement email was needed.")

        # Show forecast
        with st.expander("📈 Forecasted Inventory Needs"):
            forecast = result.get("forecast")
            if forecast:
                st.write(forecast)
            else:
                st.info("Forecast not generated.")

        # Debug: Show full result state
        with st.expander("🔍 Debug: Full Pipeline Result"):
            st.json(dict(result))

    except Exception as e:
        st.error(f"❌ Pipeline failed: {str(e)}")
        
        # Show more debug info
        st.write("Debug information:")
        st.write(f"- File exists: {os.path.exists(TEMP_FILE_PATH)}")
        if os.path.exists(TEMP_FILE_PATH):
            st.write(f"- File size: {os.path.getsize(TEMP_FILE_PATH)} bytes")
        
        # Show the full error
        import traceback
        st.code(traceback.format_exc())

    finally:
        # Optional cleanup
        if os.path.exists(TEMP_FILE_PATH):
            os.remove(TEMP_FILE_PATH)