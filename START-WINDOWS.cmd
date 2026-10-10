@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Run npm install in this folder first.
  pause
  exit /b 1
)
if not exist .env.local call npm run setup
call npm run db:setup
if errorlevel 1 (
  echo Start MongoDB and check .env.local, then try again.
  pause
  exit /b 1
)
echo Open http://localhost:3000 after the server is ready.
call npm run dev
pause
