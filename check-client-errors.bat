@echo off
echo Checking for client errors...
echo.
cd "F:\sessions apps\DAT Final App session capture changes\Digital Storming Old Working Client"

echo === Checking .env file ===
type .env
echo.

echo === Testing npm start ===
npm start

