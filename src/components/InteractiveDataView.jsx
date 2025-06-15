// /src/components/InteractiveDataView.jsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { colorMaps } from '../services/colorizer.js';
import Colorbar from './Colorbar.jsx';
import PanZoomControls from './PanZoomControls.jsx';

function drawOverlayFeatures(ctx, features, spatialIndex, layerDims, transform, strokeStyle, lineWidth) {
    if (!features || !spatialIndex) return;

    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth / transform.scale;
    ctx.beginPath();
    features.forEach(feature => {
        if (!feature || !feature.geometry) return;
        const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
        if (!polygons) return;
        polygons.forEach(poly => {
            if (!poly) return;
            poly.forEach(path => {
                if (!path) return;
                let firstPoint = true;
                path.forEach(point => {
                    const pixelPos = findClosestPixelInIndex(point[1], point[0], spatialIndex, layerDims[1]);
                    if (pixelPos) {
                        if (firstPoint) {
                            ctx.moveTo(pixelPos.x, pixelPos.y);
                            firstPoint = false;
                        } else {
                            ctx.lineTo(pixelPos.x, pixelPos.y);
                        }
                    } else {
                        firstPoint = true;
                    }
                });
            });
        });
    });
    ctx.stroke();
}

function createSpatialIndex(lats, lons) {
    if (!lats || !lons) return null;
    const domain = { minLat: Infinity, maxLat: -Infinity, minLon: Infinity, maxLon: -Infinity };
    for(let i = 0; i < lats.length; i++) {
        const lat = lats[i];
        const lon = lons[i];
        if (isNaN(lat) || isNaN(lon)) continue;
        if (lat < domain.minLat) domain.minLat = lat;
        if (lat > domain.maxLat) domain.maxLat = lat;
        if (lon < domain.minLon) domain.minLon = lon;
        if (lon > domain.maxLon) domain.maxLon = lon;
    }
    if (domain.minLat === Infinity) return null;
    const gridDivisions = 100;
    const latStep = (domain.maxLat - domain.minLat) / gridDivisions;
    const lonStep = (domain.maxLon - domain.minLon) / gridDivisions;
    const grid = Array(gridDivisions * gridDivisions).fill(null).map(() => []);
    for (let i = 0; i < lats.length; i++) {
        const lat = lats[i];
        const lon = lons[i];
        if (isNaN(lat) || isNaN(lon)) continue;
        const gridY = Math.floor((lat - domain.minLat) / latStep);
        const gridX = Math.floor((lon - domain.minLon) / lonStep);
        let gridIndex = gridY * gridDivisions + gridX;
        gridIndex = Math.max(0, Math.min(grid.length - 1, gridIndex));
        grid[gridIndex].push(i);
    }
    return { grid, domain, gridDivisions, latStep, lonStep, lats, lons };
}

function findClosestPixelInIndex(lat, lon, index, width) {
    if (!index) return null;
    const { grid, domain, gridDivisions, latStep, lonStep, lats, lons } = index;
    if (lat < domain.minLat || lat > domain.maxLat || lon < domain.minLon || lon > domain.maxLon) return null;
    const gridY = Math.floor((lat - domain.minLat) / latStep);
    const gridX = Math.floor((lon - domain.minLon) / lonStep);
    const gridIndex = gridY * gridDivisions + gridX;
    const potentialPixelIndices = grid[Math.max(0, Math.min(grid.length - 1, gridIndex))];
    if (!potentialPixelIndices || potentialPixelIndices.length === 0) return null;
    let closestPixelIndex = -1;
    let minDistanceSq = Infinity;
    for (const pixelIndex of potentialPixelIndices) {
        const pointLat = lats[pixelIndex];
        const pointLon = lons[pixelIndex];
        const distSq = Math.pow(lat - pointLat, 2) + Math.pow(lon - pointLon, 2);
        if (distSq < minDistanceSq) {
            minDistanceSq = distSq;
            closestPixelIndex = pixelIndex;
        }
    }
    const maxDist = Math.sqrt(Math.pow(latStep, 2) + Math.pow(lonStep, 2));
    if (Math.sqrt(minDistanceSq) > maxDist * 2) return null;
    return { x: closestPixelIndex % width, y: Math.floor(closestPixelIndex / width) };
}

// --- MODIFICATION START ---
// Component now accepts props for removing and reordering itself.
function InteractiveDataView({ 
    layer, 
    colormapName, 
    onSetColorMap, 
    coastlineData, 
    boundaryData, 
    toolMode, 
    onSetToolMode, 
    onPixelPick,
    onRemove,
    onReorder,
    index,
    totalLayers
}) {
// --- MODIFICATION END ---
    const viewRef = useRef(null);
    const offscreenCanvasRef = useRef(document.createElement('canvas'));
    const overlayCanvasRef = useRef(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const lastPanPoint = useRef({ x: 0, y: 0 });
    const [dataDomain, setDataDomain] = useState({ min: Infinity, max: -Infinity });
    const spatialIndex = useMemo(() => {
        if (!layer || !layer.coords) return null;
        return createSpatialIndex(layer.coords.lats, layer.coords.lons);
    }, [layer]);
        
    const [isOverlayVisible, setIsOverlayVisible] = useState(true);
    const [overlayColor, setOverlayColor] = useState('#00ffff');
    const [overlayWidth, setOverlayWidth] = useState(5.0);
    const [isColorbarVisible, setIsColorbarVisible] = useState(true);
    const [colorbarPosition, setColorbarPosition] = useState('bottom-right');


    const getDomain = (arr) => {
        let min = Infinity, max = -Infinity;
        arr.forEach(v => { if (!isNaN(v)) { if (v < min) min = v; if (v > max) max = v; } });
        return { min, max };
    };

    useEffect(() => {
        if (!layer || !layer.values) return;
        const offscreenCanvas = offscreenCanvasRef.current;
        const [height, width] = layer.dims;
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        const ctx = offscreenCanvas.getContext('2d');
        const domain = layer.domain || getDomain(layer.values);
        setDataDomain(domain);
     
        const imageData = ctx.createImageData(width, height);
        const colorizer = colorMaps[colormapName] || colorMaps.viridis;
        for (let i = 0; i < layer.values.length; i++) {
            const rgba = colorizer(layer.values[i], domain.min, domain.max);
            imageData.data[i * 4 + 0] = rgba[0]; imageData.data[i * 4 + 1] = rgba[1];
            imageData.data[i * 4 + 2] = rgba[2]; imageData.data[i * 4 + 3] = rgba[3];
        }
        ctx.putImageData(imageData, 0, 0);
        if (viewRef.current) {
            const { clientWidth, clientHeight } = viewRef.current;
            const scaleX = clientWidth / width; const scaleY = clientHeight / height;
            const initialScale = Math.min(scaleX, scaleY) * 0.95;
            setTransform({ x: (clientWidth - width * initialScale) / 2, y: (clientHeight - height * initialScale) / 2, scale: initialScale });
        }
    }, [layer, colormapName]);

    const draw = useCallback(() => {
        const overlayCanvas = overlayCanvasRef.current;
        const offscreenCanvas = offscreenCanvasRef.current;
        if (!overlayCanvas || !layer) return;
        const ctx = overlayCanvas.getContext('2d');
        const viewDiv = viewRef.current;
        if (!viewDiv) return;
        overlayCanvas.width = viewDiv.clientWidth;
        overlayCanvas.height = viewDiv.clientHeight;
  
        ctx.save();
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.scale, transform.scale);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(offscreenCanvas, 0, 0);
        
        if (isOverlayVisible) {
            const boundaryColor = `${overlayColor}99`; 
            drawOverlayFeatures(ctx, coastlineData, spatialIndex, layer.dims, transform, overlayColor, overlayWidth);
            drawOverlayFeatures(ctx, boundaryData, spatialIndex, layer.dims, transform, boundaryColor, overlayWidth / 2);
        }

        ctx.restore();
    }, [layer, transform, coastlineData, boundaryData, spatialIndex, isOverlayVisible, overlayColor, overlayWidth]);

    useEffect(() => {
        const viewDiv = viewRef.current;
        const resizeObserver = new ResizeObserver(() => draw());
        const handleWheelEvent = (e) => {
            e.preventDefault();
            const scaleAmount = e.deltaY > 0 ? 0.95 : 1.05;
            handleZoom(scaleAmount);
        };
 
        if (viewDiv) {
            resizeObserver.observe(viewDiv);
            viewDiv.addEventListener('wheel', handleWheelEvent, { passive: false });
        }
        draw();
        return () => {
            if (viewDiv) {
                resizeObserver.unobserve(viewDiv);
     
                viewDiv.removeEventListener('wheel', handleWheelEvent);
            }
        };
    }, [draw]);
    const handlePan = (dx, dy) => { setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    };
    const handleZoom = (factor) => {
        if (factor === 1) {
            const { clientWidth, clientHeight } = viewRef.current;
            const [height, width] = layer.dims;
            const scaleX = clientWidth / width; const scaleY = clientHeight / height;
            const initialScale = Math.min(scaleX, scaleY) * 0.95;
            setTransform({ x: (clientWidth - width * initialScale) / 2, y: (clientHeight - height * initialScale) / 2, scale: initialScale });
        } else {
             setTransform(prev => ({ ...prev, scale: Math.max(0.1, prev.scale * factor) }));
        }
    };
    
    const handleMouseDown = (e) => { if (toolMode === 'pan') { setIsPanning(true);
    lastPanPoint.current = { x: e.clientX, y: e.clientY }; } };
    const handleMouseUp = () => { if (toolMode === 'pan') setIsPanning(false); };
    const handleMouseMove = (e) => { if (toolMode === 'pan' && isPanning) { const dx = e.clientX - lastPanPoint.current.x;
    const dy = e.clientY - lastPanPoint.current.y; lastPanPoint.current = { x: e.clientX, y: e.clientY }; handlePan(dx, dy); } };
    const handleClick = (e) => {
        if (toolMode !== 'picker' || !layer) return;
        if (e.target.closest('.view-controls-panel')) {
            return;
        }
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const imageX = Math.floor((mouseX - transform.x) / transform.scale);
        const imageY = Math.floor((mouseY - transform.y) / transform.scale);
        const [height, width] = layer.dims;
        if (imageX >= 0 && imageX < width && imageY >= 0 && imageY < height) {
            const index = imageY * width + imageX;
            const value = layer.values[index];
            const lat = layer.coords?.lats[index];
            const lon = layer.coords?.lons[index];
            if (!isNaN(value)) {
                onPixelPick({ 
                    layerTitle: layer.title, 
                    value, 
                    units: layer.units || 'N/A', 
                    lat, 
                    lon, 
                    pixel: { x: imageX, y: imageY },
                    screenPos: { x: e.clientX, y: e.clientY }
                });
            }
        }
    };

    const handleExport = useCallback((scaleFactor) => {
        if (!layer) return;

        const [fullHeight, fullWidth] = layer.dims;
        const exportWidth = Math.floor(fullWidth * scaleFactor);
        const exportHeight = Math.floor(fullHeight * scaleFactor);

        const mainExportCanvas = document.createElement('canvas');
        mainExportCanvas.width = exportWidth;
        mainExportCanvas.height = exportHeight;
        const ctx = mainExportCanvas.getContext('2d');
        
        ctx.imageSmoothingEnabled = false; 

        ctx.drawImage(offscreenCanvasRef.current, 0, 0, exportWidth, exportHeight);
        
        if (isOverlayVisible) {
            ctx.save();
            ctx.scale(scaleFactor, scaleFactor);
            const identityTransform = { scale: 1 }; 
            const boundaryColor = `${overlayColor}99`;
            const proportionalWidth = overlayWidth / transform.scale;
            drawOverlayFeatures(ctx, coastlineData, spatialIndex, layer.dims, identityTransform, overlayColor, proportionalWidth);
            drawOverlayFeatures(ctx, boundaryData, spatialIndex, layer.dims, identityTransform, boundaryColor, proportionalWidth / 2);
            ctx.restore();
        }

        let finalCanvas = mainExportCanvas;

        if (isColorbarVisible) {
            const colorbarScaleRefWidth = 1200;
            const colorbarScale = Math.max(0.5, exportWidth / colorbarScaleRefWidth);
            const colorbarTotalWidth = 220 * colorbarScale;
            const colorbarTotalHeight = 60 * colorbarScale;
            const padding = 10 * colorbarScale;
            const fontSize = 12 * colorbarScale;
            
            const compositeCtx = finalCanvas.getContext('2d');

            let cbX = padding;
            let cbY = padding;
            if (colorbarPosition.includes('bottom')) {
                cbY = exportHeight - colorbarTotalHeight - padding;
            }
            if (colorbarPosition.includes('right')) {
                cbX = exportWidth - colorbarTotalWidth - padding;
            }
            
            const cbGradientWidth = colorbarTotalWidth - (padding * 2);
            const cbGradientHeight = 20 * colorbarScale;

            compositeCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            compositeCtx.fillRect(cbX, cbY, colorbarTotalWidth, colorbarTotalHeight);
            
            const gradient = compositeCtx.createLinearGradient(cbX + padding, 0, cbX + padding + cbGradientWidth, 0);
            const colorizer = colorMaps[colormapName] || colorMaps.viridis;
            if (dataDomain.min !== Infinity) {
                for (let i = 0; i <= 1; i += 0.01) {
                    const value = (dataDomain.min === dataDomain.max) ? dataDomain.min : dataDomain.min + (dataDomain.max - dataDomain.min) * i;
                    const rgba = colorizer(value, dataDomain.min, dataDomain.max);
                    if (!rgba.some(isNaN)) {
                        gradient.addColorStop(i, `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`);
                    }
                }
            }
            compositeCtx.fillStyle = gradient;
            compositeCtx.fillRect(cbX + padding, cbY + padding + (15 * colorbarScale), cbGradientWidth, cbGradientHeight);
            
            const colorbarTitleText = (layer.units === '1') ? layer.name : (layer.units || 'N/A');
            compositeCtx.fillStyle = 'white';
            compositeCtx.font = `${fontSize}px sans-serif`;
            compositeCtx.textAlign = 'center';
            compositeCtx.fillText(colorbarTitleText, cbX + colorbarTotalWidth / 2, cbY + padding + (12 * colorbarScale));
            
            compositeCtx.textAlign = 'left';
            compositeCtx.fillText(dataDomain.min.toFixed(2), cbX + padding, cbY + padding + cbGradientHeight + (25 * colorbarScale));
            
            compositeCtx.textAlign = 'right';
            compositeCtx.fillText(dataDomain.max.toFixed(2), cbX + padding + cbGradientWidth, cbY + padding + cbGradientHeight + (25 * colorbarScale));
        }

        const filename = `${layer.title.replace(/[^a-z0-9]/gi, '_').toUpperCase()}_${exportWidth}X${exportHeight}.png`;
        const link = document.createElement('a');
        link.download = filename;
        link.href = finalCanvas.toDataURL('image/png');
        link.click();
    }, [layer, colormapName, dataDomain, coastlineData, boundaryData, spatialIndex, isOverlayVisible, overlayColor, overlayWidth, transform, isColorbarVisible, colorbarPosition]);

    if (!layer) return null;
    const cursorStyle = toolMode === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair';
    
    const colorbarTitle = (layer.units === '1') 
        ? layer.name 
        : (layer.units || 'N/A');
    
    // --- MODIFICATION START ---
    // New styles for the view header and its buttons
    const headerStyles = {
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#343a40',
            color: 'white',
            padding: '6px 12px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
        },
        title: {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginRight: '10px'
        },
        buttonContainer: {
            display: 'flex',
            gap: '5px'
        },
        button: {
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            padding: '2px 6px',
            fontSize: '14px',
            lineHeight: 1
        },
        buttonDisabled: {
            background: '#495057',
            cursor: 'not-allowed',
            opacity: 0.5
        }
    };
    // --- MODIFICATION END ---
        
    return (
        <div className="view-container">
            {/* --- MODIFICATION START --- */}
            {/* The header is now a flex container holding the title and new buttons */}
            <div style={headerStyles.header}>
                <span style={headerStyles.title} title={layer.title || layer.name}>
                    {layer.title || layer.name}
                </span>
                {onRemove && onReorder && (
                    <div style={headerStyles.buttonContainer}>
                        <button 
                            style={index === 0 ? {...headerStyles.button, ...headerStyles.buttonDisabled} : headerStyles.button} 
                            onClick={() => onReorder(layer.name, 'left')} 
                            disabled={index === 0}
                            title="Move Left"
                        >
                            &larr;
                        </button>
                        <button 
                            style={index === totalLayers - 1 ? {...headerStyles.button, ...headerStyles.buttonDisabled} : headerStyles.button} 
                            onClick={() => onReorder(layer.name, 'right')} 
                            disabled={index === totalLayers - 1}
                            title="Move Right"
                        >
                            &rarr;
                        </button>
                        <button 
                            style={{...headerStyles.button, background: '#dc3545'}} 
                            onClick={() => onRemove(layer.name)}
                            title="Close View"
                        >
                            &times;
                        </button>
                    </div>
                )}
            </div>
            {/* --- MODIFICATION END --- */}
            <div 
                ref={viewRef}
                className="view-canvas-wrapper" 
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
                style={{ cursor: cursorStyle }}
            >
                <canvas ref={overlayCanvasRef} 
                style={{ position: 'absolute', top: 0, left: 0 }} />
                
                {isColorbarVisible && <Colorbar units={colorbarTitle} colormapName={colormapName} min={dataDomain.min} max={dataDomain.max} position={colorbarPosition} />}
                
                <PanZoomControls 
                    parentRef={viewRef}
                    onPan={handlePan} 
                    onZoom={handleZoom} 
                    onExport={handleExport} 
                    fullDims={layer.dims}
                    isOverlayVisible={isOverlayVisible}
                    onToggleOverlay={() => setIsOverlayVisible(v => !v)}
                    overlayColor={overlayColor}
                    onSetOverlayColor={(e) => setOverlayColor(e.target.value)}
                    overlayWidth={overlayWidth}
                    onSetOverlayWidth={(e) => setOverlayWidth(parseFloat(e.target.value))}
                    isColorbarVisible={isColorbarVisible}
                    onToggleColorbar={() => setIsColorbarVisible(v => !v)}
                    colorbarPosition={colorbarPosition}
                    onSetColorbarPosition={setColorbarPosition}
                    colorMap={colormapName}
                    onSetColorMap={onSetColorMap}
                    toolMode={toolMode}
                    onSetToolMode={onSetToolMode}
                />
            </div>
        </div>
    );
}

export default InteractiveDataView;