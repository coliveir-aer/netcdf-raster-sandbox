// /src/services/geoCalculator.js

/**
 * Implements the GOES-R fixed grid to latitude/longitude conversion.
 * This function now calculates the full 2D grid of lat/lon values.
 * The formulas are derived from the GOES-R PUG L1b Vol 3, section 5.1.2 and best practices.
 */
export const calculateLatLon = (dataset) => {
    // Extract projection attributes from the NetCDF global attributes
    const {
        perspective_point_height,
        semi_major_axis,
        semi_minor_axis,
        longitude_of_projection_origin,
    } = dataset.globalAttributes;

    const { x, y } = dataset.variables;

    const r_eq = parseFloat(semi_major_axis);
    const r_pol = parseFloat(semi_minor_axis);
    
    // The perspective_point_height is the distance from the surface.
    // The formula requires the distance from the center of the Earth.
    // We must add the equatorial radius to the height.
    const H = parseFloat(perspective_point_height) + r_eq;

    const lon_0 = parseFloat(longitude_of_projection_origin) * (Math.PI / 180);

    const h_sq = H * H;
    const r_eq_sq = r_eq * r_eq;
    const r_pol_sq = r_pol * r_pol;
    
    const num_pixels = y.data.length * x.data.length;
    const lats = new Float32Array(num_pixels);
    const lons = new Float32Array(num_pixels);

    let i = 0; // The index for the flattened 1D output arrays

    // Loop through each y coordinate (scan line)
    for (let j = 0; j < y.data.length; j++) {
        const y_i = y.data[j];
        const sin_y = Math.sin(y_i);
        const cos_y = Math.cos(y_i);

        // Loop through each x coordinate (pixel in scan line)
        for (let k = 0; k < x.data.length; k++) {
            const x_i = x.data[k];
            
            const sin_x = Math.sin(x_i);
            const cos_x = Math.cos(x_i);
            
            const a = sin_x * sin_x + cos_x * cos_x * (cos_y * cos_y + (r_eq_sq / r_pol_sq) * sin_y * sin_y);
            const b = -2 * H * cos_x * cos_y;
            const c = h_sq - r_eq_sq;

            const r_s_sqrt = b * b - 4 * a * c;

            if (r_s_sqrt < 0) {
                lats[i] = NaN;
                lons[i] = NaN;
            } else {
                const r_s = (-b - Math.sqrt(r_s_sqrt)) / (2 * a);
                
                const S_x = r_s * cos_x * cos_y;
                const S_y = -r_s * sin_x;
                const S_z = r_s * cos_x * sin_y;
                
                const lat = Math.atan((r_eq_sq / r_pol_sq) * (S_z / Math.sqrt(Math.pow(H - S_x, 2) + Math.pow(S_y, 2))));
                const lon = lon_0 - Math.atan2(S_y, H - S_x);
                
                lats[i] = lat * (180 / Math.PI);
                lons[i] = lon * (180 / Math.PI);
            }
            i++; 
        }
    }
    
    return { lats, lons };
};
