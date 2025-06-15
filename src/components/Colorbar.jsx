// /src/components/Colorbar.jsx
import React, { useEffect, useRef, useMemo } from 'react';
import { colorMaps } from '../services/colorizer.js';

const colorbarStyles = {
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    zIndex: 10,
    fontFamily: 'sans-serif',
    fontSize: '12px'
};

function Colorbar({ units, colormapName, min, max, position }) {
    const canvasRef = useRef(null);

    const combinedStyles = useMemo(() => {
        const positionStyles = {};
        const margin = '20px';
        
        if (position.includes('top')) {
            positionStyles.top = margin;
        } else {
            positionStyles.bottom = margin;
        }

        if (position.includes('left')) {
            positionStyles.left = margin;
        } else {
            positionStyles.right = margin;
        }

        return { ...colorbarStyles, ...positionStyles };
    }, [position]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !colorMaps[colormapName] || min === Infinity) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const colorizer = colorMaps[colormapName];

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
     
        for (let i = 0; i <= 1; i += 0.01) {
            const value = (min === max) ? min : min + (max - min) * i;
            const rgba = colorizer(value, min, max);
            if (rgba.some(isNaN)) {
                gradient.addColorStop(i, 'rgba(0,0,0,0)');
            } else {
                gradient.addColorStop(i, `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`);
            }
        }

        ctx.fillStyle = 
        gradient;
        ctx.fillRect(0, 0, width, height);

    }, [colormapName, min, max]);
    if (min === Infinity) return null;

    return (
        <div style={combinedStyles}>
            <div style={{ textAlign: 'center', marginBottom: '5px' }}>{units}</div>
            <canvas ref={canvasRef} width="200" height="20" style={{ border: '1px solid #fff' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                <span>{min.toFixed(2)}</span>
        
                <span>{max.toFixed(2)}</span>
            </div>
        </div>
    );
}

export default Colorbar;