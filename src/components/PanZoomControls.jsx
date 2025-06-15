// /src/components/PanZoomControls.jsx
import React, { useState, useRef, useEffect } from 'react';
import { colorMaps } from '../services/colorizer.js';

const controlStyles = {
    container: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        borderRadius: '5px',
        padding: '5px',
        zIndex: 20,
        width: '130px', 
        cursor: 'move', 
        userSelect: 'none' 
    },
    button: {
        background: '#fff',
        border: '1px solid #ccc',
        color: '#333',
        width: '30px',
        height: '30px',
        margin: '2px',
        cursor: 'pointer',
        fontWeight: 'bold',
        borderRadius: '3px',
    },
    panGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2px',
        width: '100px',
        marginBottom: '5px',
    },
    exportContainer: {
        marginTop: '5px',
        paddingTop: '5px',
        borderTop: '1px solid #555',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px'
    },
    exportButton: {
        background: '#d4edda',
        border: '1px solid #c3e6cb',
        color: '#155724',
        width: '100%',
        height: 'auto',
        minHeight: '30px',
        padding: '4px 2px',
        margin: '0',
        cursor: 'pointer',
        fontWeight: 'bold',
        borderRadius: '3px',
        fontSize: '10px',
        lineHeight: '1.2'
    },
    header: {
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        width: '100%',
        padding: '2px 0',
        textTransform: 'uppercase'
    },
    controlsContainer: {
        marginTop: '5px',
        paddingTop: '5px',
        borderTop: '1px solid #555',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    overlayButton: {
        background: '#e9ecef',
        border: '1px solid #ced4da',
        color: '#495057',
        width: '100%',
        padding: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        borderRadius: '3px',
    },
    overlayInputRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        color: 'white',
        fontSize: '11px'
    },
    colorInput: {
        width: '40px',
        height: '25px',
        border: '1px solid #555',
        padding: '1px',
        cursor: 'pointer',
        backgroundColor: 'transparent'
    },
    sliderInput: {
        flexGrow: 1,
        marginLeft: '8px',
        minWidth: 0
    },
    posButtonContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3px'
    },
    posButton: {
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        color: '#212529',
        padding: '4px',
        fontSize: '10px',
        cursor: 'pointer',
        borderRadius: '3px'
    },
    posButtonActive: {
        background: '#007bff',
        color: 'white',
        borderColor: '#0056b3'
    },
    selectInput: {
        width: '100%',
        backgroundColor: '#e9ecef',
        border: '1px solid #ced4da',
        borderRadius: '3px',
        padding: '4px 2px',
        cursor: 'pointer'
    },
    // --- MODIFICATION START ---
    // New styles for the tool mode radio buttons
    toolModeContainer: {
        width: '100%',
        color: 'white',
        fontSize: '11px'
    },
    toolModeLabel: {
        display: 'block',
        padding: '2px 0',
        cursor: 'pointer'
    }
    // --- MODIFICATION END ---
};

function PanZoomControls({
    onPan,
    onZoom,
    onExport,
    fullDims,
    isOverlayVisible,
    onToggleOverlay,
    overlayColor,
    onSetOverlayColor,
    overlayWidth,
    onSetOverlayWidth,
    isColorbarVisible,
    onToggleColorbar,
    colorbarPosition,
    onSetColorbarPosition,
    parentRef,
    colorMap,
    onSetColorMap,
    // --- MODIFICATION START ---
    // Component now receives toolMode state and its handler
    toolMode,
    onSetToolMode
    // --- MODIFICATION END ---
}) {
    const [pos, setPos] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 }); 
    const panelStartPos = useRef({ x: 0, y: 0 }); 
    const panelRef = useRef(null);

    const handleMouseDown = (e) => {
        const nonDraggableTags = ['INPUT', 'BUTTON', 'LABEL', 'SELECT'];
        if (nonDraggableTags.includes(e.target.tagName)) {
            return;
        }
        
        e.stopPropagation();
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        panelStartPos.current = pos;
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !parentRef.current || !panelRef.current) return;
            const dx = e.clientX - dragStartPos.current.x;
            const dy = e.clientY - dragStartPos.current.y;
            
            const parentRect = parentRef.current.getBoundingClientRect();
            const panelRect = panelRef.current.getBoundingClientRect();

            let newX = panelStartPos.current.x + dx;
            let newY = panelStartPos.current.y + dy;
            
            if (newX < 0) newX = 0;
            if (newY < 0) newY = 0;
            if (newX + panelRect.width > parentRect.width) newX = parentRect.width - panelRect.width;
            if (newY + panelRect.height > parentRect.height) newY = parentRect.height - panelRect.height;
            
            setPos({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, parentRef]);
    
    // --- MODIFICATION START ---
    // This new function renders the relocated Tool Mode selector
    const renderToolModeControls = () => {
        return (
            <div style={controlStyles.controlsContainer}>
                <div style={controlStyles.header}>Tool</div>
                <div style={controlStyles.toolModeContainer}>
                    <label style={controlStyles.toolModeLabel}>
                        <input type="radio" name="tool" value="pan" checked={toolMode === 'pan'} onChange={() => onSetToolMode('pan')} />
                        {' '}Pan
                    </label>
                    <label style={controlStyles.toolModeLabel}>
                        <input type="radio" name="tool" value="picker" checked={toolMode === 'picker'} onChange={() => onSetToolMode('picker')} />
                        {' '}Picker
                    </label>
                </div>
            </div>
        );
    };
    // --- MODIFICATION END ---
    
    const renderExportButtons = () => {
        if (!fullDims || fullDims.length !== 2) return null;
        const [h, w] = fullDims;
        const resolutions = [
            { label: 'Full', scale: 1, w, h },
            { label: 'Half', scale: 0.5, w: Math.floor(w / 2), h: Math.floor(h / 2) },
            { label: 'Quarter', scale: 0.25, w: Math.floor(w / 4), h: Math.floor(h / 4) }
        ];
        return (
            <div style={controlStyles.controlsContainer}>
                <div style={controlStyles.header}>Download</div>
                {resolutions.map(res => (
                    <button key={res.label} style={controlStyles.exportButton} onClick={() => onExport(res.scale)}>
                        {res.label}<br />{`(${res.w} x ${res.h})`}
                    </button>
                ))}
            </div>
        );
    };

    const renderOverlayControls = () => {
        return (
            <div style={controlStyles.controlsContainer}>
                <div style={controlStyles.header}>Map Overlay</div>
                <button style={controlStyles.overlayButton} onClick={onToggleOverlay}>
                    {isOverlayVisible ? 'Hide Map' : 'Show Map'}
                </button>
                <div style={controlStyles.overlayInputRow}>
                    <label htmlFor="color-picker">Color:</label>
                    <input type="color" id="color-picker" style={controlStyles.colorInput} value={overlayColor} onChange={onSetOverlayColor} />
                </div>
                <div style={controlStyles.overlayInputRow}>
                    <label htmlFor="width-slider">Width:</label>
                    <input type="range" id="width-slider" style={controlStyles.sliderInput} min="0.5" max="10" step="0.1" value={overlayWidth} onChange={onSetOverlayWidth} />
                </div>
            </div>
        );
    };
    
    const renderColorbarControls = () => {
        const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        const labels = {'top-left': 'TL', 'top-right': 'TR', 'bottom-left': 'BL', 'bottom-right': 'BR'};
        return (
            <div style={controlStyles.controlsContainer}>
                <div style={controlStyles.header}>Colorbar</div>
                <select 
                    style={controlStyles.selectInput}
                    value={colorMap}
                    // --- MODIFICATION START ---
                    // This now correctly extracts the value from the event object before calling the handler.
                    onChange={(e) => onSetColorMap(e.target.value)}
                    // --- MODIFICATION END ---
                >
                    {Object.keys(colorMaps).sort().map(name => <option key={name} value={name}>{name}</option>)}
                </select>
                <button style={controlStyles.overlayButton} onClick={onToggleColorbar}>
                    {isColorbarVisible ? 'Hide Colorbar' : 'Show Colorbar'}
                </button>
                <div style={controlStyles.overlayInputRow}>
                    <label>Position:</label>
                    <div style={controlStyles.posButtonContainer}>
                        {positions.map(p => (
                            <button 
                                key={p} 
                                style={{
                                    ...controlStyles.posButton, 
                                    ...(colorbarPosition === p ? controlStyles.posButtonActive : {})
                                }}
                                onClick={() => onSetColorbarPosition(p)}
                            >
                                {labels[p]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div 
            ref={panelRef}
            style={{...controlStyles.container, left: `${pos.x}px`, top: `${pos.y}px`}}
            onMouseDown={handleMouseDown}
        >
            <div style={controlStyles.panGrid}>
                <div />
                <button style={controlStyles.button} onClick={() => onPan(0, 20)}>↑</button>
                <div />
                <button style={controlStyles.button} onClick={() => onPan(20, 0)}>←</button>
                <button style={controlStyles.button} onClick={() => onZoom(1)}>⌾</button>
                <button style={controlStyles.button} onClick={() => onPan(-20, 0)}>→</button>
                <div />
                <button style={controlStyles.button} onClick={() => onPan(0, -20)}>↓</button>
                <div />
            </div>
            <div>
                <button style={controlStyles.button} onClick={() => onZoom(1.2)}>+</button>
                <button style={controlStyles.button} onClick={() => onZoom(0.8)}>-</button>
            </div>
            {/* --- MODIFICATION START --- */}
            {/* The new tool mode selector is now rendered here */}
            {renderToolModeControls()}
            {/* --- MODIFICATION END --- */}
            {renderOverlayControls()}
            {renderColorbarControls()}
            {renderExportButtons()}
        </div>
    );
}

export default PanZoomControls;