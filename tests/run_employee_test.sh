#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fetch Employees Test Runner${NC}"
echo "=================================="

# Check if .env file exists, create if not
if [ ! -f .env ]; then
  echo -e "${YELLOW}No .env file found. You have two options:${NC}"
  echo "1. Run the setup script to create it interactively:"
  echo "   node ./tests/setup_env.js"
  echo
  echo "2. Let this script create a default .env file for you."
  echo
  echo -e "${YELLOW}Would you like to create a default .env file now? (y/n)${NC}"
  read -p "> " create_env
  
  if [[ $create_env == "y" || $create_env == "Y" ]]; then
    echo -e "${YELLOW}Creating default .env file...${NC}"
    cat > .env << EOL
# API configuration
API_BASE_URL=http://localhost:5000/api

# Test credentials (replace with actual values)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password

# Auth token (optional, will be obtained through login if not provided)
AUTH_TOKEN=
EOL
    echo -e "${GREEN}.env file created. Please update with your actual credentials.${NC}"
    echo "Edit the .env file with your actual credentials before running the test."
    exit 1
  else
    echo -e "${YELLOW}Please run 'node ./tests/setup_env.js' to set up your environment.${NC}"
    exit 1
  fi
fi

# Install dependencies if needed
echo -e "${YELLOW}Checking/installing dependencies...${NC}"
if ! npm list axios &> /dev/null || ! npm list colors &> /dev/null; then
  echo "Installing required packages..."
  npm install --save-dev axios colors dotenv
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}Node.js is not installed. Please install Node.js to run this test.${NC}"
  exit 1
fi

# Run the test
echo -e "${YELLOW}Running fetchEmployees tests...${NC}"
node ./tests/fetchEmployees.test.js

# Check exit code
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Test completed successfully!${NC}"
else
  echo -e "${RED}Test failed!${NC}"
  exit 1
fi 