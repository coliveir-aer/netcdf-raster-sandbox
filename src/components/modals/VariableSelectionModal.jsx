// /src/components/modals/VariableSelectionModal.jsx
import React, { useState } from 'react';

export function VariableSelectionModal({ data, onSelect, onClose }) {
    const [selectedVar, setSelectedVar] = useState(data.variables[0]);
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Select Variable to Visualize</h3>
                <p>Found the following variables in the file:</p>
                <select value={selectedVar} onChange={(e) => setSelectedVar(e.target.value)} style={{width: '100%', marginBottom: '1rem'}}>
                    {data.variables.length > 0 ? 
                        data.variables.map(v => <option key={v} value={v}>{v}</option>) :
                        <option>No suitable variables found</option>
                    }
                </select>
                <div className="modal-actions">
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={() => onSelect(data.urlOrName, selectedVar)} style={{marginLeft: '0.5rem'}} disabled={data.variables.length === 0}>Load Layer</button>
                </div>
            </div>
        </div>
    );
}