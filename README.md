# Traceless

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![License](https://img.shields.io/badge/license-MIT-green)

Traceless is a browser extension that detects and monitors tracking requests across the web. It features a retro terminal-inspired interface and provides tools to analyze and visualize data flow.

## Features

- **Real-time Detection**: Identifies requests to known tracking domains (analytics, advertising, social media, etc.).
- **Dashboard Popup**: Shows immediate statistics on the current page with a retro terminal aesthetic.
- **Detailed Analysis**: A dedicated page listing all detected trackers with filtering, categorization, and request count breakdown.
- **Data Map**: Interactive force-directed graph visualization showing the relationship between the user and tracking entities.
- **Data Persistence**: Tracks data across the browsing session until explicitly cleared.
- **Export**: Ability to export tracker data to JSON format.

## Project Structure

- `manifest.json`: Extension configuration (Manifest V2).
- `background/`: Background service worker handling request monitoring and data storage.
- `popup/`: Main extension popup interface.
- `pages/details/`: Detailed tracker list view logic and styling.
- `pages/graph/`: Graph visualization logic using HTML5 Canvas.
- `data/`: Contains the tracker database (`trackers.json`).

## Installation

### Firefox
1. Open Firefox and navigate to `about:debugging`.
2. Click on "This Firefox" in the sidebar.
3. Click "Load Temporary Add-on...".
4. Select the `manifest.json` file from the project directory.

### Chrome / Chromium
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable "Developer mode" in the top right corner.
3. Click "Load unpacked".
4. Select the project folder.

## Usage

1. Click the extension icon in the toolbar to view the popup dashboard.
2. The popup displays total trackers and requests for the session.
3. Click "Details" to open the full tracker list.
4. Click "Data Map" to view the interactive graph.
5. Use "Clear" to reset the session data.
