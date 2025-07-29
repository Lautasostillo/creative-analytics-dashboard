from fastapi import APIRouter
import pandas as pd, pathlib
import logging
import numpy as np

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BASE = pathlib.Path("public/data")
grid = pd.read_parquet(BASE / "grid.parquet")
creatives = pd.read_parquet(BASE / "creatives.parquet")

logger.info(f"Loaded creatives.parquet with {len(creatives)} rows and {creatives['GRID_KEY'].nunique()} unique GRID_KEYs")

# Log some sample GRID_KEYs for debugging
sample_keys = creatives['GRID_KEY'].head(10).tolist()
logger.info(f"Sample GRID_KEYs: {sample_keys}")

@router.get("/grid")
async def grid_all():
    # Return the complete data from creatives.parquet instead of grid.parquet
    # Fix NaN values for JSON serialization
    result = creatives.to_dict(orient="records")
    
    # Fix NaN values for JSON serialization - more robust approach
    for record in result:
        for k, v in record.items():
            if pd.isna(v) or (isinstance(v, float) and np.isnan(v)):
                record[k] = None
            elif isinstance(v, str) and v.lower() == 'nan':
                record[k] = None
    
    return result

@router.get("/grid/{key}")
async def grid_cell(key: str):
    try:
        logger.info(f"Searching for GRID_KEY: {key}")
        
        # Simple test first
        if key == "test":
            return {"message": "test endpoint works"}
        
        filtered = creatives[creatives.GRID_KEY == key]
        logger.info(f"Found {len(filtered)} rows for key: {key}")
        
        if len(filtered) == 0:
            logger.warning(f"No data found for GRID_KEY: {key}")
            # Log all available GRID_KEYs for debugging
            all_keys = creatives['GRID_KEY'].unique().tolist()
            logger.info(f"Available GRID_KEYs: {all_keys[:10]}... (showing first 10)")
            return []
        
        # Return fields that we know work
        working_fields = [
            'Ad Name', 'TONE', 'PERSONA', 'STYLE', 'GRID_KEY', 
            'Strategic_Summary', 'High_Fidelity_Description', 'Scene_by_Scene_Breakdown',
            'CONCEPT', 'INSIGHT', 'MESSAGING_THEME', 'FINANCIAL_EMOTION',
            'SPEND', 'CLICKS', 'IMPRESSIONS', 'CTR', 'CPC', 'CPM', 'CTR_pct'
        ]
        available_fields = [f for f in working_fields if f in filtered.columns]
        result = filtered[available_fields].to_dict(orient="records")
        
        # Fix NaN values for JSON serialization - more robust approach
        for record in result:
            for k, v in record.items():
                if pd.isna(v) or (isinstance(v, float) and np.isnan(v)):
                    record[k] = None
                elif isinstance(v, str) and v.lower() == 'nan':
                    record[k] = None
        
        logger.info(f"Returning {len(result)} records with working fields")
        return result
        
    except Exception as e:
        logger.error(f"Error in grid_cell: {str(e)}")
        return {"error": str(e)}
