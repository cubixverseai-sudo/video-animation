@echo off
echo 🛑 Killing all Node.js processes...
taskkill /F /IM node.exe

echo.
echo 🧹 Cleaning Next.js cache...
if exist "apps\web\.next" rmdir /s /q "apps\web\.next"

echo.
echo 🚀 Starting server...
pnpm dev
pause
