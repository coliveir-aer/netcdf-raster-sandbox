// /src/components/App.jsx
import React, { useState, useCallback, useEffect } from 'react';
import MainLayout from './MainLayout.jsx';
import { processInitialFile, extractVariableData } from '../services/dataProvider.js';
import { NotificationProvider, useNotifier } from '../contexts/NotificationContext.jsx';
import { H5WasmProvider, useH5Wasm } from '../providers/H5WasmProvider.jsx';
import createLogger from '../services/logger.js';
import PixelInfoDisplay from './PixelInfoDisplay.jsx';

const logger = createLogger('App');
function AppContent() {
    const notifier = useNotifier();
    const { isReady: isWasmReady, api: h5wasmApi } = useH5Wasm();
    const [dataSources, setDataSources] = useState({});
    const [activeLayers, setActiveLayers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Loading...');
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [colorMap, setColorMap] = useState('grayscale');
    const [specialViews, setSpecialViews] = useState({ lat: false, lon: false, map: false });
    const [toolMode, setToolMode] = useState('pan');
    const [pixelInfo, setPixelInfo] = useState(null);

    const addDataSource = useCallback(async (fileBuffer, fileName) => {
        if (!isWasmReady) { notifier.error("Data parser not ready."); return; }
        if (dataSources[fileName]) { notifier.error('This data source is already loaded.'); return; }
        
        setLoadingMessage('Processing Metadata...');
        setIsLoading(true);
        try {
            const initialData = await processInitialFile(h5wasmApi, fileBuffer);
   
             if (initialData.variables.length === 0) {
                throw new Error("No 2D variables found in the file.");
            }
            
            setDataSources(prev => ({ 
                ...prev, 
       
                 [fileName]: { ...initialData, fileBuffer, name: fileName } 
            }));
            
            const primaryVariable = initialData.variables[0].name;
            await handleSelectVariable(fileName, primaryVariable);
            
            notifier.success(`Data source '${fileName}' loaded successfully.`);
        } catch (error) {
            logger.error(`Error processing data source ${fileName}:`, error);
            notifier.error(`Error processing source: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [isWasmReady, dataSources, notifier, h5wasmApi]);
    
    const handleSelectVariable = async (sourceName, variableName) => {
        if (activeLayers.some(l => l.name === variableName)) {
            logger.info(`Layer ${variableName} is already active.`);
            return;
        }

        setLoadingMessage(`Loading Layer: ${variableName}...`);
        setIsLoading(true);
        const source = dataSources[sourceName];
        if (!source || !source.fileBuffer) return;

        try {
            const varData = await extractVariableData(h5wasmApi, source.fileBuffer, variableName);
            const newLayer = {
                ...source, 
                name: variableName,
                title: `${sourceName} - ${variableName}`,
                values: varData.values,
                dims: varData.dims,
          
                units: varData.units,
            };
            setActiveLayers(prev => [...prev, newLayer]);
        } catch (error) {
            logger.error(`Error loading variable ${variableName}:`, error);
            notifier.error(`Failed to load layer: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveLayer = (layerNameToRemove) => {
        setActiveLayers(prev => prev.filter(layer => layer.name !== layerNameToRemove));
        logger.info(`Layer '${layerNameToRemove}' removed.`);
    };

    const handleReorderLayer = (layerNameToMove, direction) => {
        const currentIndex = activeLayers.findIndex(l => l.name === layerNameToMove);
        if (currentIndex === -1) return;

        const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
        if (newIndex < 0 || newIndex >= activeLayers.length) return;

        const newLayers = [...activeLayers];
        const temp = newLayers[currentIndex];
        newLayers[currentIndex] = newLayers[newIndex];
        newLayers[newIndex] = temp;
        
        setActiveLayers(newLayers);
    };
    
    const handleToggleSpecialView = (viewName) => {
        const hasGeoSource = Object.values(dataSources).some(ds => ds.isGeospatial);
        if (!hasGeoSource) {
            notifier.error("Load a geospatial (GOES) file to use this feature.");
            return;
        }
        setSpecialViews(prev => ({ ...prev, [viewName]: !prev[viewName] }));
    };
    const handlePixelPick = (info) => {
        setPixelInfo(info);
    };
    useEffect(() => {
        const loadFromUrl = async () => {
            const params = new URLSearchParams(window.location.search);
            const fileUrl = params.get('fileUrl');

            if (fileUrl) {
                const fileName = fileUrl.split('/').pop();
       
                 setLoadingMessage(`Downloading: ${fileName}`);
                setIsLoading(true);
                setDownloadProgress(0);
                try {
                    const response = await fetch(fileUrl);
                 
                   if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    
                    const reader = response.body.getReader();
                    const contentLength = +response.headers.get('Content-Length');
                    let receivedLength = 0;
 
                    let chunks = [];
                    
                    while(true) {
                        const {done, value} = await reader.read();
                        if (done) break;
                        chunks.push(value);
                        receivedLength += value.length;
                        if (contentLength) {
                            setDownloadProgress(Math.round((receivedLength / contentLength) * 100));
                        }
                    }

                    let chunksAll = new Uint8Array(receivedLength);
                    let position = 0;
                    for(let chunk of chunks) {
                        chunksAll.set(chunk, position);
                        position += chunk.length;
                    }
                    
                    setDownloadProgress(0);
                    await addDataSource(chunksAll.buffer, fileName);
                } catch (error) {
                    logger.error("Failed to load file from URL:", error);
                    notifier.error(`Failed to load file from URL: ${error.message}`);
                } finally {
                    setIsLoading(false);
                    setDownloadProgress(0);
                }
            }
        };
        if (isWasmReady) {
            loadFromUrl();
        }
    }, [isWasmReady]);


    if (!isWasmReady) {
        return <div className="loading-overlay">Initializing Application...</div>;
    }

    // --- MODIFICATION START ---
    // This derived state checks if any loaded data source has the 'isGeospatial' flag.
    const hasGoesData = Object.values(dataSources).some(ds => ds.isGeospatial);
    // --- MODIFICATION END ---

    return (
        <>
            {isLoading && (
                 <div className="loading-overlay">
                    <div className="loading-content">
                        {loadingMessage}
          
                         {downloadProgress > 0 && (
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{ width: `${downloadProgress}%` }}>
                
                                     {downloadProgress}%
                                </div>
                            </div>
                    
                     )}
                    </div>
                </div>
            )}
            <MainLayout
                dataSources={dataSources}
                activeLayers={activeLayers}
                onAddDataSource={addDataSource}
                onSelectVariable={handleSelectVariable}
                onRemoveLayer={handleRemoveLayer}
                onReorderLayer={handleReorderLayer}
                onToggleSpecialView={handleToggleSpecialView}
                specialViews={specialViews}
                colorMap={colorMap}
                onSetColorMap={setColorMap}
                toolMode={toolMode}
                onSetToolMode={setToolMode}
                onPixelPick={handlePixelPick}
                // --- MODIFICATION START ---
                // The boolean flag is passed down to the layout component.
                hasGoesData={hasGoesData}
                // --- MODIFICATION END ---
            />
            <PixelInfoDisplay 
                pixelInfo={pixelInfo}
                onClose={() => setPixelInfo(null)}
            />
        </>
    );
}

function App() {
    return (
        <NotificationProvider>
            <H5WasmProvider>
                <AppContent />
            </H5WasmProvider>
        </NotificationProvider>
    );
}

export default App;