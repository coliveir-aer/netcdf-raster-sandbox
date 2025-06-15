// /src/components/DataSourceManager.jsx
import React from 'react';

const managerStyles = {
  border: '1px solid #ccc',
  padding: '10px',
  borderRadius: '4px',
  marginTop: '1rem'
};

const sourceHeaderStyles = {
    background: '#f0f2f5',
    padding: '8px 12px',
    borderBottom: '1px solid #ddd',
    fontWeight: 'bold',
    fontSize: '1rem'
};

const variableListStyles = {
    padding: '5px 0'
};

const variableItemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: '3px',
    marginBottom: '2px',
};

const closeButtonStyles = {
    cursor: 'pointer',
    color: '#a00',
    fontWeight: 'bold',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #fcc',
    background: '#fff0f0'
};

const specialViewButtonStyles = {
    display: 'block',
    width: '100%',
    padding: '8px',
    marginTop: '5px',
    textAlign: 'left',
    background: '#e9ecef',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    cursor: 'pointer',
};


function DataSourceManager({ dataSources, activeLayers, onSelectVariable, onRemoveLayer, onToggleSpecialView, specialViews }) {
    const isLayerActive = (layerName) => activeLayers.some(l => l.name === layerName);

    return (
        <div style={managerStyles}>
            <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Data &amp; Layers</h4>
            {Object.keys(dataSources).length === 0 ? (
                <p>No data sources loaded.</p>
            ) : (
                Object.entries(dataSources).map(([sourceName, sourceData]) => (
                    <div key={sourceName}>
                        <div style={sourceHeaderStyles}>{sourceName}</div>
                        <div style={variableListStyles}>
                            {sourceData.variables.map(varInfo => {
                                const isActive = isLayerActive(varInfo.name);
                                return (
                                <div 
                                    key={varInfo.name}
                                    style={{
                                        ...variableItemStyles,
                                        backgroundColor: isActive ? '#e7f5ff' : 'transparent',
                                    }}
                                    onClick={() => !isActive && onSelectVariable(sourceName, varInfo.name)}
                                >
                                    <span style={{ fontWeight: isActive ? 'bold' : 'normal' }}>
                                        {varInfo.name}
                                    </span>
                                    {isActive && (
                                        <div style={closeButtonStyles} onClick={(e) => { e.stopPropagation(); onRemoveLayer(varInfo.name); }}>
                                            &times;
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    </div>
                ))
            )}

            <div style={{ marginTop: '20px' }}>
                <h4 style={{borderTop: '1px solid #ddd', paddingTop: '15px'}}>Derived Views</h4>
                <button style={{...specialViewButtonStyles, background: specialViews.lat ? '#cce5ff' : '#e9ecef' }} onClick={() => onToggleSpecialView('lat')}>
                    Latitude Raster
                </button>
                <button style={{...specialViewButtonStyles, background: specialViews.lon ? '#cce5ff' : '#e9ecef' }} onClick={() => onToggleSpecialView('lon')}>
                    Longitude Raster
                </button>
                <button style={{...specialViewButtonStyles, background: specialViews.map ? '#cce5ff' : '#e9ecef' }} onClick={() => onToggleSpecialView('map')}>
                    Map Overlay
                </button>
            </div>
        </div>
    );
}

export default DataSourceManager;
