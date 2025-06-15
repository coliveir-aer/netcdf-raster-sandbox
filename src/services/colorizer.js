// /src/services/colorizer.js

/**
 * Simple linear interpolation
 * @param {number} x - The value.
 * @param {number} x1 - The start of the range.
 * @param {number} x2 - The end of the range.
 * @param {number} y1 - The start of the output range.
 * @param {number} y2 - The end of the output range.
 * @returns {number} - The interpolated value.
 */
function lerp(x, x1, x2, y1, y2) {
    return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
}

const viridis_colors = [
    [68, 1, 84], [72, 40, 120], [62, 74, 137], [49, 104, 142],
    [38, 130, 142], [31, 158, 137], [53, 183, 121], [109, 205, 89],
    [180, 222, 44], [253, 231, 37]
];
const jet_colors = [
    [0, 0, 131], [0, 60, 170], [5, 255, 255], [255, 255, 0], 
    [250, 100, 0], [240, 0, 0], [130, 0, 0]
];
const rainbow_colors = [
    [150, 0, 90], [0, 0, 200], [0, 255, 0], [255, 255, 0], 
    [255, 127, 0], [255, 0, 0]
];
function applyColormap(value, min, max, colors) {
    if (isNaN(value)) return [0, 0, 0, 0];
    
    // --- MODIFICATION START ---
    // If the data range is zero, all values are the same. Return the first color in the map.
    // This prevents division by zero in the 'normalized' calculation below.
    if (min === max) {
        return [...colors[0], 255];
    }
    // --- MODIFICATION END ---

    const normalized = (value - min) / (max - min);
    if (normalized < 0) return [...colors[0], 255];
    if (normalized > 1) return [...colors[colors.length - 1], 255];
    const idx = normalized * (colors.length - 1);
    const i1 = Math.floor(idx);
    const i2 = Math.ceil(idx);
    const t = idx - i1;
    if (i1 === i2) return [...colors[i1], 255];
    const r = lerp(t, 0, 1, colors[i1][0], colors[i2][0]);
    const g = lerp(t, 0, 1, colors[i1][1], colors[i2][1]);
    const b = lerp(t, 0, 1, colors[i1][2], colors[i2][2]);
    return [r, g, b, 255];
}

// Base color maps
const baseColorMaps = {
    grayscale: (value, min, max) => {
        if (isNaN(value)) return [0, 0, 0, 0];

        // --- MODIFICATION START ---
        // If the data range is zero, return a single mid-gray color.
        // This prevents division by zero in the 'v' calculation below.
        if (min === max) {
            return [128, 128, 128, 255];
        }
        // --- MODIFICATION END ---

        const v = Math.round(((value - min) / (max - min)) * 255);
        return [v, v, v, 255];
    },
    viridis: (value, min, max) => applyColormap(value, min, max, viridis_colors),
    jet: (value, min, max) => applyColormap(value, min, max, jet_colors),
    rainbow: (value, min, max) => applyColormap(value, min, max, rainbow_colors),
};
// --- Generate the final export with reversed versions included ---
const finalColorMaps = {};
// Add standard and reversed versions to the final export object
for (const name in baseColorMaps) {
    // Add the standard version
    finalColorMaps[name] = baseColorMaps[name];
    // Create and add the reversed version
    if (name === 'grayscale') {
        finalColorMaps.grayscale_r = (value, min, max) => {
            if (isNaN(value)) return [0, 0, 0, 0];

            // --- MODIFICATION START ---
            // Also handle the zero-range case for the reversed grayscale.
            if (min === max) {
                return [128, 128, 128, 255];
            }
            // --- MODIFICATION END ---

            const v = 255 - Math.round(((value - min) / (max - min)) * 255);
            return [v, v, v, 255];
        };
    } else {
        const colorArray = name === 'viridis' ?
        viridis_colors : name === 'jet' ? jet_colors : rainbow_colors;
        const reversed_colors = colorArray.slice().reverse();
        finalColorMaps[`${name}_r`] = (value, min, max) => applyColormap(value, min, max, reversed_colors);
    }
}

export const colorMaps = finalColorMaps;