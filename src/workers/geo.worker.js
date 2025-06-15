// src/workers/geo.worker.js
import * as Comlink from 'comlink';
import { calculateLatLon } from '../services/geoCalculator';

const geoService = {
  /**
   * Performs the geospatial calculation.
   * @param {object} dataset - An object containing global attributes and variables.
   * @returns {Promise<{lats: Float32Array, lons: Float32Array}>} - A promise that resolves with the coordinate arrays.
   */
  process: async (dataset) => {
    console.log('Worker: Received dataset for geo calculation.');
    const { lats, lons } = calculateLatLon(dataset);
    console.log('Worker: Calculation complete. Posting back results.');
    // The arrays are returned as Transferable objects to avoid copying them, improving performance.
    return Comlink.transfer({ lats, lons }, [lats.buffer, lons.buffer]);
  }
};

Comlink.expose(geoService);