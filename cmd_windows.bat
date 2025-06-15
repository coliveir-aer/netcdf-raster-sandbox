:: /cmd_windows.bat
@echo off
setlocal

:: --- Configuration ---
set "NODE_VERSION=v20.14.0"
set "NODE_DIR=%CD%\tools\node-%NODE_VERSION%-win-x64"
set "PORTABLE_GIT_DIR=%CD%\tools\PortableGit"

:: --- Set up the environment path for this session ---
:: Add both Git and Node to the PATH
set "PATH=%PORTABLE_GIT_DIR%\bin;%PORTABLE_GIT_DIR%\cmd;%NODE_DIR%;%PATH%"

:: --- Set a custom prompt title and message ---
title NetCDF Sandbox Dev Command Prompt
echo.
echo #########################################################
echo # Local Git & Node.js Development Environment is Active
echo #########################################################
echo.
echo You can now run manual commands like:
echo   - git status
echo   - npm audit
echo   - npm run build
echo.
echo Close this window when you are finished.
echo.

:: The /K switch starts a new cmd instance and keeps it running.
cmd /K