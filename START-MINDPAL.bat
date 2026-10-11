@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22.9 or newer from https://nodejs.org and run this again.
  pause
  exit /b 1
)
node -e "const v=process.versions.node.split('.').map(Number);process.exit(v[0]>22||(v[0]===22&&v[1]>=9)?0:1)"
if errorlevel 1 (
  echo Please update Node.js to version 22.9 or newer.
  pause
  exit /b 1
)
if not exist node_modules\mongodb (
  call npm ci
  if errorlevel 1 (
    echo Dependency installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)
echo Open http://localhost:3000 in your browser after the server starts.
echo Keep this window open while using MindPal. Press Ctrl+C to stop.
start "" http://localhost:3000
call npm start
pause
