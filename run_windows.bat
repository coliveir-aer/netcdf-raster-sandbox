:: /run_windows.bat
@echo off
setlocal

:: --- This single script now handles both SETUP and RUN for Windows ---

:: --- Configuration ---
set "NODE_VERSION=v20.14.0"
set "NODE_DIST_URL=https://nodejs.org/dist/%NODE_VERSION%/node-%NODE_VERSION%-win-x64.zip"
set "TOOLS_DIR=%CD%\tools"
set "NODE_DIR=%TOOLS_DIR%\node-%NODE_VERSION%-win-x64"
set "NODE_ZIP_FILE=%TOOLS_DIR%\node.zip"


:: --- Main Logic ---

:: Check if the project is already fully installed and ready to run
if exist "%CD%\node_modules\vite\bin\vite.js" (
    goto :run_application
)


:: --- If not ready, prompt user to begin the full setup ---
echo.
echo [INFO] Project dependencies not found or incomplete.
:prompt
set /p "userInput=Would you like to run the installation process now? (y/n): "
if /i "%userInput%"=="y" ( goto :run_setup )
if /i "%userInput%"=="n" (
    echo [INFO] Setup canceled by user.
    goto :error_exit
)
echo [ERROR] Invalid input. Please enter 'y' or 'n'.
goto :prompt


:run_setup
:: This section runs only if the user agrees to the setup prompt
echo.
echo [INFO] Starting one-time setup...
echo [INFO] This may take several minutes.
echo.
:: 1. Create tools directory
if not exist "%TOOLS_DIR%" (
    echo [SETUP] Creating tools directory...
    mkdir "%TOOLS_DIR%"
)

:: 2. Download and Extract Node.js if it's not already there
if exist "%NODE_DIR%\node.exe" (
    echo [SETUP] Local Node.js found. Skipping download.
) else (
    echo [SETUP] Downloading Node.js...
    powershell -Command "(New-Object System.Net.WebClient).DownloadFile('%NODE_DIST_URL%', '%NODE_ZIP_FILE%')" || goto :error_exit
    echo [SETUP] Extracting Node.js...
    powershell -Command "Expand-Archive -Path '%NODE_ZIP_FILE%' -DestinationPath '%TOOLS_DIR%'" || goto :error_exit
    del "%NODE_ZIP_FILE%"
)

:: 3. Set the PATH for the rest of THIS script's execution
echo [SETUP] Activating local Node.js environment...
set "PATH=%NODE_DIR%;%PATH%"

:: 4. Verify Node.js and npm
echo [SETUP] Verifying Node.js and npm versions...
call node -v
call npm -v
echo.
:: 5. Install Dependencies using the new package.json
echo [SETUP] Installing dependencies with 'npm install'...
call npm install
if %errorlevel% neq 0 (
    echo [FATAL ERROR] 'npm install' failed. Please check errors above.
    goto :error_exit
)
echo [SETUP] Dependencies installed successfully.
echo.

echo #######################################################
echo # One-Time Setup Complete!
echo #######################################################
echo.
goto :run_application


:run_application
:: This section runs EITHER after a successful setup OR immediately if setup was already done.
:: The PATH needs to be set here as well for subsequent runs.
set "PATH=%NODE_DIR%;%PATH%"

echo [INFO] Starting the Vite development server...
echo [INFO] A new browser window should open automatically.
echo [INFO] Press CTRL+C in this window to stop the server.
echo.
call npm start

if %errorlevel% neq 0 (
    echo [ERROR] The development server failed to start.
    goto :error_exit
)

goto :eof


:error_exit
echo.
echo [FAILURE] The script encountered an error or was canceled.
echo Please review the messages above to diagnose the issue.
echo The window will not close until you press a key.
pause
exit /b 1