// /src/components/Uploader.jsx
import React, { useCallback } from 'react';
import { useNotifier } from '../contexts/NotificationContext.jsx'; // Updated import


const uploaderStyles = {
    border: '2px dashed #ccc',
    padding: '2rem',
    textAlign: 'center',
    marginBottom: '1rem',
    cursor: 'pointer'
};

function Uploader({ onConfigLoaded, onNcFileLoaded }) {
  const notifier = useNotifier();

  const handleFile = useCallback((file) => {
    console.log('[Uploader] handleFile triggered for:', file.name); // <-- ADDED LOG
    const extension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    // ADDED: Error handler for the file reader
    reader.onerror = (e) => {
        console.error('[Uploader] FileReader error:', e);
        notifier.error('An error occurred while trying to read the file.');
    };

    if (extension === 'json') {
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          if (!config.layerName || !config.url || !config.primaryVariable) {
              notifier.error('Invalid config format. Must include layerName, url, and primaryVariable.');
              return;
          }
          onConfigLoaded(config);
        } catch (error) { 
            console.error(error);
            notifier.error('Invalid JSON file.'); 
        }
      };
      reader.readAsText(file);
    } else if (extension === 'nc') {
      reader.onload = (e) => {
        console.log('[Uploader] File read successfully. Calling onNcFileLoaded.'); // <-- ADDED LOG
        onNcFileLoaded(e.target.result, file.name);
      };
      reader.readAsArrayBuffer(file);
    } else {
      notifier.error('Unsupported file type. Please upload a .json or .nc file.');
    }
  }, [onConfigLoaded, onNcFileLoaded, notifier]);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFile(event.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const onDragOver = (event) => event.preventDefault();
  
  const onFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
        handleFile(event.target.files[0]);
    }
  };

  return (
    <div>
        <input type="file" id="file-input" style={{display: 'none'}} onChange={onFileChange} accept=".json,.nc"/>
        <label htmlFor="file-input">
            <div style={uploaderStyles} onDrop={onDrop} onDragOver={onDragOver}>
                <p>Drag & drop config (.json) or data (.nc) file here, or click to select.</p>
            </div>
        </label>
    </div>
  );
}

export default Uploader;