// /src/components/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import * as topojson from 'topojson-client';
import Uploader from './Uploader.jsx';
import DataSourceManager from './DataSourceManager.jsx';
import InteractiveDataView from './InteractiveDataView.jsx';

// --- MODIFICATION START ---
// Styles are simplified. Positioning is now handled by a wrapper div.
const attributionStyles = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '5px 10px',
    borderRadius: '3px',
    fontSize: '10px',
    color: '#333',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
    display: 'inline-block' // Ensures the background fits the text
};
// --- MODIFICATION END ---

function MainLayout({ 
    dataSources, 
    activeLayers, 
    onAddDataSource, 
    onSelectVariable, 
    onRemoveLayer,
    onReorderLayer,
    onToggleSpecialView,
    specialViews,
    colorMap, 
    onSetColorMap,
    toolMode,
    onSetToolMode,
    onPixelPick,
    hasGoesData
}) {
    const [coastlineData, setCoastlineData] = useState(null);
    const [boundaryData, setBoundaryData] = useState(null);

    useEffect(() => {
        fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`[MainLayout] HTTP error fetching map data! status: ${response.status}`);
                }
        
                return response.json();
            })
            .then(data => {
                const land = topojson.feature(data, data.objects.land);
                const countries = topojson.feature(data, data.objects.countries);
                
         
                setCoastlineData([land]);
                setBoundaryData(countries.features);
            })
            .catch(e => console.error("[MainLayout] Failed to fetch or process map data:", e));
    }, []);
    const handleNcFileLoaded = (buffer, name) => {
        onAddDataSource(buffer, name);
    };
    const geoSource = Object.values(dataSources).find(ds => ds.isGeospatial);
    const geoSourceDims = geoSource && geoSource.variables.length > 0 ? geoSource.variables[0].shape : null;
    return (
        <div className="main-layout">
            <div className="sidebar">
                <h3>Controls</h3>
                <Uploader onNcFileLoaded={handleNcFileLoaded} />
                
                <DataSourceManager 
 
                   dataSources={dataSources}
                    activeLayers={activeLayers}
                    onSelectVariable={onSelectVariable}
                    onRemoveLayer={onRemoveLayer}
                    onToggleSpecialView={onToggleSpecialView}
 
                   specialViews={specialViews}
                />
                
            </div>
            {/* --- MODIFICATION START --- */}
            {/* A new wrapper div is introduced to correctly manage layout and position the attribution. */}
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, backgroundColor: '#e9ecef' }}>
                {/* The content-grid itself is now a flex child that grows to fill available space */}
                <div className="content-grid" style={{ flexGrow: 1 }}>
                    {activeLayers.map((layer, index) => (
                        <InteractiveDataView 
                            key={layer.name}
                            layer={layer} 
                            colormapName={colorMap}
                            onSetColorMap={onSetColorMap}
                            coastlineData={coastlineData}
                            boundaryData={boundaryData}
                            toolMode={toolMode}
                            onSetToolMode={onSetToolMode}
                            onPixelPick={onPixelPick}
                            onRemove={onRemoveLayer}
                            onReorder={onReorderLayer}
                            index={index}
                            totalLayers={activeLayers.length}
                        />
                    ))}
                    
                    {specialViews.lat && geoSource && geoSourceDims && (
                        <InteractiveDataView
                           key="latitude-view"
                            layer={{ name: 'latitude', title: 'Latitude', values: geoSource.coords.lats, dims: geoSourceDims, domain: geoSource.latLonDomain.lat, coords: geoSource.coords }}
                            colormapName={colorMap}
                            onSetColorMap={onSetColorMap}
                            coastlineData={coastlineData}
                           boundaryData={boundaryData}
                            toolMode={toolMode}
                            onSetToolMode={onSetToolMode}
                            onPixelPick={onPixelPick}
                        />
                    )}
                      {specialViews.lon && geoSource && geoSourceDims && (
                        <InteractiveDataView
                            key="longitude-view"
                            layer={{ name: 'longitude', title: 'Longitude', values: geoSource.coords.lons, dims: geoSourceDims, domain: 
                             geoSource.latLonDomain.lon, coords: geoSource.coords }}
                            colormapName={colorMap}
                            onSetColorMap={onSetColorMap}
                            coastlineData={coastlineData}
                            boundaryData={boundaryData}
                            toolMode={toolMode}
                            onSetToolMode={onSetToolMode}
                            onPixelPick={onPixelPick}
                        />
                    )}
                     {specialViews.map && geoSource && geoSourceDims && (
                       <InteractiveDataView
                            key="map-overlay-view"
                            layer={{ 
                                name: 'map_overlay', 
                             title: 'Map Overlay', 
                                values: new Float32Array(geoSource.coords.lats.length).fill(1), 
                                dims: geoSourceDims, 
                             domain: {min: 0, max: 1}, 
                                coords: geoSource.coords 
                            }}
                            colormapName={'grayscale'}
                            onSetColorMap={onSetColorMap}
                            coastlineData={coastlineData}
                            boundaryData={boundaryData}
                            toolMode={toolMode}
                            onSetToolMode={onSetToolMode}
                            onPixelPick={onPixelPick}
                         />
                    )}
                </div>
                
                {/* The attribution is now a sibling of the content-grid, inside the new flex wrapper. */}
                {hasGoesData && (
                    <div style={{ textAlign: 'center', padding: '4px' }}>
                        <span style={attributionStyles}>
                            Data from NOAA's Geostationary Operational Environmental Satellites (GOES)-R Series
                        </span>
                    </div>
                )}
            </div>
            {/* --- MODIFICATION END --- */}
        </div>
    );
}

export default MainLayout;