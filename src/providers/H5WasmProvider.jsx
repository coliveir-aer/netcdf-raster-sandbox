// /src/providers/H5WasmProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as h5wasmApiModule from 'h5wasm'; // Import as namespace

// Replace createLogger usage with direct console.log equivalents
const H5WasmContext = createContext(null);
export const useH5Wasm = () => useContext(H5WasmContext);

export function H5WasmProvider({ children }) {
    const [h5, setH5] = useState({ isReady: false, api: null });

    useEffect(() => {
        const init = async () => {
            try {
                console.log("[H5WasmProvider] Initializing h5wasm module...");

                // --- DEBUGGING: Check what h5wasmApiModule actually is ---
                console.log('[H5WasmProvider] h5wasmApiModule imported object:', h5wasmApiModule);
                console.log('[H5WasmProvider] Type of h5wasmApiModule imported object:', typeof h5wasmApiModule);
                if (h5wasmApiModule.default) {
                    console.log('[H5WasmProvider] h5wasmApiModule.default exists, type:', typeof h5wasmApiModule.default);
                }
                // --- END DEBUGGING ---

                // If there's a 'ready' promise on the imported module (typical for WASM libs):
                if (h5wasmApiModule.ready) {
                    console.log("[H5WasmProvider] Awaiting h5wasmApiModule.ready promise...");
                    await h5wasmApiModule.ready; // Wait for the internal WASM module to be ready
                    console.log("[H5WasmProvider] h5wasmApiModule.ready promise resolved.");
                } else {
                    console.log("[H5WasmProvider] h5wasmApiModule.ready promise not found, assuming it's ready on import or self-initializes.");
                }

                // The API itself seems to be the imported object directly
                const h5wasmReadyApi = h5wasmApiModule;

                console.log("[H5WasmProvider] h5wasm module API is available.");
                setH5({ isReady: true, api: h5wasmReadyApi });

            } catch (e) {
                console.error("[H5WasmProvider] Fatal Error: Failed to initialize h5wasm module.", e);
                setH5({ isReady: false, api: null });
            }
        };
        init();
    }, []);

    return (
        <H5WasmContext.Provider value={h5}>
            {children}
        </H5WasmContext.Provider>
    );
}
