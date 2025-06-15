// /src/services/dataProvider.js
import * as Comlink from 'comlink';
const worker = new Worker(new URL('../workers/geo.worker.js', import.meta.url), { type: 'module' });
const geoService = Comlink.wrap(worker);

const findVariable = (h5, group, varName) => {
    try {
        const keys = Array.from(group.keys());
        if (keys.includes(varName)) {
            const item = group.get(varName);
            if (!(item instanceof h5.Group)) { return item; }
        }
        for (const key of keys) {
            const item = group.get(key);
            if (item instanceof h5.Group) {
                const found = findVariable(h5, item, varName);
                if (found) { return found; }
            }
        }
    } catch (e) { console.error("Error inside findVariable:", e); }
    return null;
};

const getDomain = (arr) => {
    let min = Infinity, max = -Infinity;
    arr.forEach(v => {
        if (!isNaN(v)) {
            if (v < min) min = v;
            if (v > max) max = v;
        }
    });
    return { min, max };
};

const unpackData = (variable, applyFillValue) => {
    const rawData = variable.value;
    const scaleAttr = variable.attrs.scale_factor;
    const offsetAttr = variable.attrs.add_offset;
    const fillAttr = applyFillValue ? variable.attrs._FillValue : null;

    const scale = scaleAttr ? scaleAttr.value[0] : 1.0;
    const offset = offsetAttr ? offsetAttr.value[0] : 0.0;
    const fillValue = fillAttr ? fillAttr.value[0] : null;

    const unpacked = new Float32Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        const rawValue = rawData[i];
        if (applyFillValue && fillValue !== null && rawValue === fillValue) {
            unpacked[i] = NaN;
        } else {
            unpacked[i] = (rawValue * scale) + offset;
        }
    }
    return unpacked;
};

// This function now also extracts the units for each variable
export const processInitialFile = async (h5, arrayBuffer) => {
    const uniqueFilename = `meta_${Date.now()}`;
    h5.FS.writeFile(uniqueFilename, new Uint8Array(arrayBuffer));
    const f = new h5.File(uniqueFilename, 'r');
    try {
        const rootGroup = f.get('/');
        const variables = [];
        const findVars = (group) => {
            for (const key of group.keys()) {
                const item = group.get(key);
                if (item instanceof h5.Group) {
                    findVars(item);
                } else {
                    const units = item.attrs.units ? item.attrs.units.value : 'N/A';
                    variables.push({ name: key, shape: item.shape, units });
                }
            }
        };
        findVars(rootGroup);

        const metadata = {
            variables: variables.filter(v => v.shape.length === 2),
            coords: null,
            isGeospatial: false,
            latLonDomain: null,
        };

        const projVar = findVariable(h5, rootGroup, 'goes_imager_projection');
        if (projVar) {
            const geoAttrs = {};
            for (const key in projVar.attrs) {
                geoAttrs[key] = projVar.attrs[key].value;
            }

            const xVar = findVariable(h5, rootGroup, 'x');
            const yVar = findVariable(h5, rootGroup, 'y');
            if (xVar && yVar) {
                const xCoordsRadians = unpackData(xVar, false);
                const yCoordsRadians = unpackData(yVar, false);
                
                const geoData = {
                    globalAttributes: geoAttrs,
                    variables: { x: { data: xCoordsRadians }, y: { data: yCoordsRadians } }
                };
                
                const { lats, lons } = await geoService.process(geoData);
                metadata.coords = { lats, lons };
                metadata.isGeospatial = true;
                metadata.latLonDomain = {
                    lat: getDomain(lats),
                    lon: getDomain(lons),
                };
            }
        }
        return metadata;

    } finally {
        f.close();
        h5.FS.unlink(uniqueFilename);
    }
};

// This function now also returns the units
export const extractVariableData = async (h5, arrayBuffer, variableName) => {
    const uniqueFilename = `data_${Date.now()}`;
    h5.FS.writeFile(uniqueFilename, new Uint8Array(arrayBuffer));
    const f = new h5.File(uniqueFilename, 'r');
    try {
        const rootGroup = f.get('/');
        const dataVar = findVariable(h5, rootGroup, variableName);
        if (!dataVar) throw new Error(`Variable ${variableName} not found.`);

        const values = unpackData(dataVar, true);
        const dims = dataVar.shape;
        const units = dataVar.attrs.units ? dataVar.attrs.units.value : 'N/A';

        return { values, dims, units };
    } finally {
        f.close();
        h5.FS.unlink(uniqueFilename);
    }
};
