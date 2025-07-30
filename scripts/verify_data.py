#!/usr/bin/env python3
"""
Script to verify data files before deployment
"""
import pandas as pd
import pathlib
import sys
import os
import json

def verify_parquet_file(file_path: str, expected_columns: list = None) -> bool:
    """Verify a parquet file is valid and has expected structure"""
    try:
        print(f"🔍 Checking {file_path}...")
        
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return False
            
        # Check file size
        file_size = os.path.getsize(file_path)
        if file_size < 1000:  # Less than 1KB
            print(f"⚠️  Warning: File is very small ({file_size} bytes): {file_path}")
            
        # Try to read the file
        df = pd.read_parquet(file_path)
        print(f"✅ Successfully read {file_path}")
        print(f"   - Shape: {df.shape}")
        print(f"   - Columns: {list(df.columns)}")
        
        if expected_columns:
            missing_cols = set(expected_columns) - set(df.columns)
            if missing_cols:
                print(f"⚠️  Warning: Missing expected columns: {missing_cols}")
            else:
                print(f"✅ All expected columns present")
                
        return True
        
    except Exception as e:
        print(f"❌ Error reading {file_path}: {str(e)}")
        return False

def verify_json_file(file_path: str) -> bool:
    """Verify a JSON file is valid"""
    try:
        print(f"🔍 Checking {file_path}...")
        
        if not os.path.exists(file_path):
            print(f"❌ File not found: {file_path}")
            return False
            
        # Check file size
        file_size = os.path.getsize(file_path)
        if file_size < 10:  # Less than 10 bytes
            print(f"⚠️  Warning: File is very small ({file_size} bytes): {file_path}")
            
        # Try to read the file
        with open(file_path, 'r') as f:
            data = json.load(f)
        print(f"✅ Successfully read {file_path}")
        print(f"   - Type: {type(data)}")
        if isinstance(data, list):
            print(f"   - Items: {len(data)}")
        elif isinstance(data, dict):
            print(f"   - Keys: {list(data.keys())}")
                
        return True
        
    except Exception as e:
        print(f"❌ Error reading {file_path}: {str(e)}")
        return False

def main():
    print("🚀 Data Verification Script")
    print("=" * 50)
    
    base_path = pathlib.Path("public/data")
    
    # Files to check
    parquet_files = [
        ("creatives.parquet", ["Ad Name", "TONE", "PERSONA", "STYLE", "SPEND", "CLICKS", "IMPRESSIONS", "CTR"]),
        ("grid.parquet", ["GRID_KEY", "CTR", "SPEND", "IMPRESSIONS"]),
        ("ads.parquet", ["Ad Name", "TONE", "PERSONA", "STYLE"]),
        ("clusters_tags.parquet", ["cluster_id", "creatives", "ctr"]),
    ]
    
    json_files = [
        "insights.json",
    ]
    
    all_good = True
    
    # Check Parquet files
    for filename, expected_columns in parquet_files:
        file_path = base_path / filename
        if not verify_parquet_file(str(file_path), expected_columns):
            all_good = False
        print()
    
    # Check JSON files
    for filename in json_files:
        file_path = base_path / filename
        if not verify_json_file(str(file_path)):
            all_good = False
        print()
    
    print("=" * 50)
    if all_good:
        print("✅ All data files verified successfully!")
        return 0
    else:
        print("❌ Some data files have issues. Please fix before deploying.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 