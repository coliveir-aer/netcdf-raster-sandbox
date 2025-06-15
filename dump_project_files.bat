@echo off
:: This script is included to dump the project contents to a .txt file suitable to feed into an LLM for development assistance.
:: It has been updated to reflect the current project structure.

set "output_file=project_files_dump.txt"

echo Creating a fresh dump of project files...
if exist "%output_file%" del "%output_file%"

echo Dumping files into %output_file%...

:: --- Root Files ---
(
    echo.
    echo ==================== FILE: .gitignore ====================
    type ".gitignore" 2>nul
    echo.
    echo ==================== FILE: build_windows.bat ====================
    type "build_windows.bat" 2>nul
    echo.
    echo ==================== FILE: clean_and_reinstall.bat ====================
    type "clean_and_reinstall.bat" 2>nul
    echo.
    echo ==================== FILE: cmd_windows.bat ====================
    type "cmd_windows.bat" 2>nul
    echo.
    echo ==================== FILE: index.html ====================
    type "index.html" 2>nul
    echo.
    echo ==================== FILE: install_git.bat ====================
    type "install_git.bat" 2>nul
    echo.
    echo ==================== FILE: package.json ====================
    type "package.json" 2>nul
    echo.
    echo ==================== FILE: README.md ====================
    type "README.md" 2>nul
    echo.
    echo ==================== FILE: run_windows.bat ====================
    type "run_windows.bat" 2>nul
    echo.
    echo ==================== FILE: vite.config.js ====================
    type "vite.config.js" 2>nul
) >> "%output_file%"

:: --- Src Folder ---
(
    echo.
    echo ==================== FILE: src\index.css ====================
    type "src\index.css" 2>nul
    echo.
    echo ==================== FILE: src\index.jsx ====================
    type "src\index.jsx" 2>nul
) >> "%output_file%"

:: --- Src Components Folder ---
(
    echo.
    echo ==================== FILE: src\components\App.jsx ====================
    type "src\components\App.jsx" 2>nul
    echo.
    echo ==================== FILE: src\components\Colorbar.jsx ====================
    type "src\components\Colorbar.jsx" 2>nul
    echo.
    echo ==================== FILE: src\components\DataSourceManager.jsx ====================
    type "src\components\DataSourceManager.jsx" 2>nul
    echo.
    echo ==================== FILE: src\components\InteractiveDataView.jsx ====================
    type "src\components\InteractiveDataView.jsx" 2>nul
    echo.
    echo ==================== FILE: src\components\MainLayout.jsx ====================
    type "src\components\MainLayout.jsx" 2>nul
    echo.
    echo ==================== FILE: src\components\PanZoomControls.jsx ====================
    type "src\components\PanZoomControls.jsx" 2>nul
    echo.
    echo ==================== FILE: src\components\PixelInfoDisplay.jsx ====================
    type "src\components\PixelInfoDisplay.jsx" 2>nul
    echo.
    echo ==================== FILE: src\components\Uploader.jsx ====================
    type "src\components\Uploader.jsx" 2>nul
) >> "%output_file%"

:: --- Src Components Modals Folder ---
(
    echo.
    echo ==================== FILE: src\components\modals\VariableSelectionModal.jsx ====================
    type "src\components\modals\VariableSelectionModal.jsx" 2>nul
) >> "%output_file%"

:: --- Src Contexts Folder ---
(
    echo.
    echo ==================== FILE: src\contexts\NotificationContext.jsx ====================
    type "src\contexts\NotificationContext.jsx" 2>nul
) >> "%output_file%"

:: --- Src Providers Folder ---
(
    echo.
    echo ==================== FILE: src\providers\H5WasmProvider.jsx ====================
    type "src\providers\H5WasmProvider.jsx" 2>nul
) >> "%output_file%"

:: --- Src Services Folder ---
(
    echo.
    echo ==================== FILE: src\services\colorizer.js ====================
    type "src\services\colorizer.js" 2>nul
    echo.
    echo ==================== FILE: src\services\dataProvider.js ====================
    type "src\services\dataProvider.js" 2>nul
    echo.
    echo ==================== FILE: src\services\geoCalculator.js ====================
    type "src\services\geoCalculator.js" 2>nul
    echo.
    echo ==================== FILE: src\services\logger.js ====================
    type "src\services\logger.js" 2>nul
) >> "%output_file%"

:: --- Src Workers Folder ---
(
    echo.
    echo ==================== FILE: src\workers\geo.worker.js ====================
    type "src\workers\geo.worker.js" 2>nul
) >> "%output_file%"

echo.
echo Done. The file dump is complete.
pause
