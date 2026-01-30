#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}MongoDB Index Cleanup Script${NC}"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js is not installed. Please install Node.js to run this script.${NC}"
  exit 1
fi

# Create scripts directory if it doesn't exist
mkdir -p scripts

# Check if the file exists
if [ ! -f "scripts/drop_notification_indexes.js" ]; then
  echo -e "${RED}Error: scripts/drop_notification_indexes.js file not found.${NC}"
  exit 1
fi

# Ensure dotenv is installed
echo -e "${YELLOW}Checking dependencies...${NC}"
if ! npm list dotenv &> /dev/null; then
  echo "Installing dotenv package..."
  npm install dotenv
fi

if ! npm list mongoose &> /dev/null; then
  echo "Installing mongoose package..."
  npm install mongoose
fi

# Run the Node.js script
echo -e "${YELLOW}Running index cleanup script...${NC}"
node scripts/drop_notification_indexes.js

# Check exit code
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Script completed successfully!${NC}"
else
  echo -e "${RED}Script failed!${NC}"
  exit 1
fi 