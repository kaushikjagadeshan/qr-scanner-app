# Barcode Scanner Application

This is a simple barcode scanner application built with Node.js and Express.js. It allows users to scan barcodes, validate them, and save them to a file with timestamps.

## Features
- Scans barcodes and validates them.
- Checks for duplicate barcodes.
- Saves barcodes with timestamps to a file.
- Displays alerts for errors and success.
- Automatically focuses on the input field for seamless scanning.

## Prerequisites
- Node.js (v14 or later)
- npm (Node Package Manager)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/scanner.git
   cd scanner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage
1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:4000
   ```

## Project Structure
```
scanner/
├── assets/
│   └── Veero-Logo.png       # Logo for the application
├── scanned-data.txt         # File to store scanned barcodes with timestamps
├── server.js                # Node.js server file
├── index.html               # Frontend HTML file
├── index.js                 # Frontend JavaScript file
├── package.json             # Node.js dependencies and scripts
├── README.md                # Project documentation
```

## License
This project is licensed under the ISC License.
