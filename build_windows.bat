:: /build_windows.bat
@echo off
setlocal

:: --- Configuration ---
set "NODE_VERSION=v20.14.0"
set "NODE_DIR=%CD%\tools\node-%NODE_VERSION%-win-x64"

:: --- Set up the environment path for this session ---
echo [INFO] Setting up local Node.js environment...
set "PATH=%NODE_DIR%;%PATH%"

:: --- Check if dependencies are installed ---
if not exist "%CD%\node_modules" (
    echo [ERROR] 'node_modules' folder not found.
    echo [ERROR] Please run 'setup_windows.bat' at least once before building.
    pause
    goto :eof
)

:: --- Run the production build command ---
echo [INFO] Creating an optimized production build...
echo [INFO] This may take a minute.
npm run build

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] The build process failed. Please review the errors above.
    pause
    goto :eof
)

echo.
echo #####################################################################
echo # Build successful!
echo #####################################################################
echo.
echo The production-ready files are in the '/build' directory.
echo You can deploy the contents of this folder to any static web host.
echo.
pause
endlocal