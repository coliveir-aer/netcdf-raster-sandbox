// /src/components/PixelInfoDisplay.jsx
import React from 'react';

const popupStyles = {
    container: {
        position: 'fixed', 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        padding: '1rem',
        zIndex: 2000, 
        width: '260px',
        pointerEvents: 'auto' 
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 0,
        marginBottom: '0.75rem',
        fontSize: '1.1rem',
        color: '#495057'
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        lineHeight: '1',
        cursor: 'pointer',
        padding: '0 0 0 1rem',
        color: '#888'
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.25rem 0',
        fontSize: '0.9rem',
    },
    label: {
        color: '#6c757d',
    },
    value: {
        fontWeight: 'bold',
        color: '#212529',
    }
};

function PixelInfoDisplay({ pixelInfo, onClose }) {
    if (!pixelInfo) {
        return null;
    }

    const { layerTitle, value, units, lat, lon, pixel, screenPos } = pixelInfo;
    
    return (
        <div style={{ ...popupStyles.container, top: screenPos.y + 15, left: screenPos.x + 15 }}>
            <div style={popupStyles.header}>
                <span>Pixel Inspector</span>
                <button style={popupStyles.closeButton} onClick={onClose} title="Close">
                    &times;
                </button>
            </div>
            <div style={popupStyles.row}>
                <span style={popupStyles.label}>Layer:</span>
                <span style={popupStyles.value}>{layerTitle}</span>
            </div>
            <div style={popupStyles.row}>
                <span style={popupStyles.label}>Value:</span>
                {/* --- MODIFICATION START --- */}
                {/* The typo is fixed here. 'style{...}' has been changed to 'style={...}'. */}
                <span style={popupStyles.value}>{value.toFixed(4)} {units}</span>
                {/* --- MODIFICATION END --- */}
            </div>
            <div style={popupStyles.row}>
                <span style={popupStyles.label}>Latitude:</span>
                <span style={popupStyles.value}>{lat ? lat.toFixed(4) + '°' : 'N/A'}</span>
            </div>
            <div style={popupStyles.row}>
                <span style={popupStyles.label}>Longitude:</span>
                <span style={popupStyles.value}>{lon ? lon.toFixed(4) + '°' : 'N/A'}</span>
            </div>
             <div style={popupStyles.row}>
                <span style={popupStyles.label}>Pixel (X, Y):</span>
                <span style={popupStyles.value}>{pixel.x}, {pixel.y}</span>
            </div>
        </div>
    );
}

export default PixelInfoDisplay;