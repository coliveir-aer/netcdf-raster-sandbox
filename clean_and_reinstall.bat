:: /clean_and_reinstall.bat
@echo off
setlocal

:: --- Configuration ---
set "NODE_VERSION=v20.14.0"
set "NODE_DIR=%CD%\tools\node-%NODE_VERSION%-win-x64"

:: --- Set up the environment path for this session ---
echo [INFO] Activating local Node.js environment...
set "PATH=%NODE_DIR%;%PATH%"

:: --- Step 1: Force Clean the NPM Cache ---
echo.
echo [STEP 1 of 3] Forcing a clean of the NPM cache...
call npm cache clean --force
if %errorlevel% neq 0 (
    echo [FATAL ERROR] 'npm cache clean' failed.
    goto :error_exit
)
echo [SUCCESS] NPM cache cleared.

:: --- Step 2: Delete Old Dependencies ---
echo.
echo [STEP 2 of 3] Deleting old 'node_modules' folder and 'package-lock.json' file...
if exist "node_modules" (
    rmdir /s /q "node_modules"
)
if exist "package-lock.json" (
    del "package-lock.json"
)
echo [SUCCESS] Old dependencies removed.

:: --- Step 3: Install All Dependencies from a Clean State ---
echo.
echo [STEP 3 of 3] Installing all project dependencies from scratch...
echo This will take several minutes...
call npm install
if %errorlevel% neq 0 (
    echo [FATAL ERROR] 'npm install' failed. Please check the output above for errors.
    goto :error_exit
)
echo [SUCCESS] Dependencies installed successfully.

echo.

:: --- Final Instructions ---
echo #######################################################
echo # Project setup and installation complete!
echo #######################################################
echo.
echo You can now start the application by running 'run_windows.bat'
echo (or by typing 'npm start' in this window).
echo.
goto :success_exit

:error_exit
echo.
echo [FAILURE] The script encountered a fatal error.
echo The window will not close until you press a key.
pause
exit /b 1

:success_exit
pause