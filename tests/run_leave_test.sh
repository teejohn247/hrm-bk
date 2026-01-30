#!/bin/bash

# Script to run the leave management system date handling tests

# Change to the project root directory
cd "$(dirname "$0")/.." || exit

# Bold and color text
BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
RESET="\033[0m"

echo -e "${BOLD}Leave Management System Date Handling Test${RESET}"
echo "This script will test the date handling functionality in the leave management system."
echo

# Check if .env file exists, if not, create it from .env.test template
if [ ! -f .env ]; then
  echo -e "${YELLOW}No .env file found. Creating one from .env.test template...${RESET}"
  cp .env.test .env
  echo -e "${YELLOW}Please update the .env file with valid credentials before running tests.${RESET}"
  echo -e "${YELLOW}Edit the file at: $(pwd)/.env${RESET}"
  echo
  echo "Do you want to continue with the test? (y/n)"
  read -r response
  if [[ ! "$response" =~ ^[Yy] ]]; then
    echo "Test aborted. Please update the .env file and run the test again."
    exit 0
  fi
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/axios" ] || [ ! -d "node_modules/dotenv" ]; then
  echo -e "${YELLOW}Installing required dependencies...${RESET}"
  npm install axios dotenv mongoose --save-dev
fi

# Check if the API server is running
echo -e "${YELLOW}Checking if the API server is running...${RESET}"
API_URL=$(grep -o 'API_URL=.*' .env | sed 's/API_URL=//')
CHECK_URL=$(echo "$API_URL" | sed 's|/api$||')
CHECK_URL=${CHECK_URL:-http://localhost:5000}

# Try to connect to the API server
if ! curl -s --head --request GET "$CHECK_URL" > /dev/null; then
  echo -e "${RED}ERROR: API server is not running at $CHECK_URL${RESET}"
  echo "Please start the API server before running this test."
  exit 1
fi

echo -e "${GREEN}API server is running.${RESET}"
echo

# Run the test
echo -e "${BOLD}Running leave management date handling tests...${RESET}"
node tests/leave_actions_test.js

# Check the exit status
status=$?
if [ $status -eq 0 ]; then
  echo -e "\n${GREEN}✅ All tests completed successfully.${RESET}"
else
  echo -e "\n${RED}❌ Tests failed with exit code $status.${RESET}"
fi

exit $status 