#!/bin/bash

echo "🚀 Creative Analytics Dashboard - Deploy Script"
echo "================================================"

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Regenerate all data files
echo "🔄 Regenerating data files..."
python scripts/data_prep.py
python scripts/genome_prep.py
python scripts/rebuild_clusters.py
python scripts/insights.py

# Verify all data files
echo "✅ Verifying data files..."
python scripts/verify_data.py

if [ $? -ne 0 ]; then
    echo "❌ Data verification failed. Please fix issues before deploying."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix issues before deploying."
    exit 1
fi

echo "✅ Deploy preparation complete!"
echo "🚀 Ready to deploy to Railway!"
echo ""
echo "Next steps:"
echo "1. Commit your changes: git add . && git commit -m 'Fix deploy issues'"
echo "2. Push to Railway: git push railway main"
echo ""
echo "The application should now work correctly on Railway!" 