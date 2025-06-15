# NetCDF Raster Sandbox

A browser-based tool for visualizing and analyzing 2D raster data from NetCDF (.nc) files, with special support for GOES satellite imagery.

All the data processing occurs in your browser client through the magic of web assembly.  This project makes use of the [h5wasm project](https://github.com/usnistgov/h5wasm) to load netcdf files directly in the browser with no backend required.

Try using the [GOES Data Explorer](https://coliveir-aer.github.io/goes-data-explorer/) (https://coliveir-aer.github.io/goes-data-explorer/) to test it out!  It provides a link to automatically load data public files from AWS S3 buckets into the sandbox web UI at [https://coliveir-aer.github.io/netcdf-react-experiment/](https://coliveir-aer.github.io/netcdf-react-experiment/).  You can also load locally downloaded .nc or .h5 files directly into the viewer.

## Core Features

* **Multi-Canvas Display**: Load and display multiple data layers side-by-side in a responsive grid. Each individual view can be closed or reordered using controls in its header.  
* **Floating Pixel Inspector**: Switch from "Pan" to "Picker" mode to click any pixel on an image. A floating info box appears at your cursor, instantly showing the pixel's underlying data value, units, and geographic coordinates.  
* **Consolidated On-Canvas Controls**: Each data view features its own draggable control panel, giving you instant access to pan, zoom, tool selection (Pan/Picker), colormap choice, and all overlay settings without leaving the data view.  
* **Customizable Map Overlays**: Automatically renders coastlines and detailed state/country boundaries on any geospatial layer. You can toggle the map's visibility and customize the overlay color and line width from the control panel.  
* **Flexible Colorbar**: The colorbar legend can be toggled on or off and moved to any corner of the data view to avoid obscuring data.  
* **Advanced PNG Export**: Export any data view as a high-quality PNG file at full, half, or quarter resolution. The exported image includes all visible map overlays and the colorbar, rendered in your chosen position.  
* **Browser-Based Processing**: Upload and parse NetCDF files directly in the browser using WebAssembly. All heavy calculations run in a background web worker to keep the UI responsive.  
* **Smart Attribution**: Automatically displays the official NOAA data attribution notice at the bottom of the viewer when GOES-R series data is loaded.  
* **Easy Windows Setup**: A .bat script handles the entire setup, including downloading a local copy of Node.js.

## Getting Started

* **Windows**: Double-click run\_windows.bat to automatically set up and launch the project.  
* **Other Platforms**: With Node.js installed, run npm install && npm start.

## Available Scripts

In addition to standard scripts like npm start and npm run build, the project includes several Windows batch files for convenience:

* run\_windows.bat: For easy setup and execution.  
* build\_windows.bat: For creating production builds.  
* clean\_and\_reinstall.bat: For a fresh start.  
* cmd\_windows.bat: For a pre-configured command prompt.

## Technology Stack

React, Vite, h5wasm, Comlink, TopoJSON, CSS.
