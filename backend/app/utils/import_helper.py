"""
Import helper utility to fix path issues across the backend
"""
import sys
from pathlib import Path

def setup_project_paths():
    """
    Set up the correct paths for importing from libs.core
    This should be called at the top of any module that needs to import from libs
    """
    # Find the solar_installer_ai directory by looking for it in the path
    current_file = Path(__file__).resolve()
    project_root = None
    
    for parent in current_file.parents:
        if parent.name == "solar_installer_ai":
            project_root = parent
            break
    
    if project_root is None:
        # Fallback: assume we're in backend and go up to find solar_installer_ai
        # This file is in backend/app/utils/, so go up 3 levels to backend, then 1 more to project root
        project_root = current_file.parent.parent.parent.parent
    
    libs_path = project_root / "libs"
    
    # Add both project root and libs to Python path
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))
    if str(libs_path) not in sys.path:
        sys.path.insert(0, str(libs_path))
    
    return project_root, libs_path

# Call this automatically when the module is imported
PROJECT_ROOT, LIBS_PATH = setup_project_paths()
