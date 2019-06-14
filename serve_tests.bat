@ECHO OFF
ECHO "Changing to test environment"
set NODE_ENV=test
ECHO "Starting tests"
npm run test
