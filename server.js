const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000; // Changed port to 4000
const filePath = path.join(__dirname, 'scanned-data.txt');

app.use(express.json());

// Serve static files (HTML, JS, etc.)
app.use(express.static(__dirname));

// Serve the assets folder
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Endpoint to save data
app.post('/save', (req, res) => {
    const { value } = req.body;
    console.log(`Saving barcode: ${value}`);
    if (value) {
        // Generate a custom timestamp in the format: YYYY-MM-DD HH:mm:ss
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const dataToWrite = `${value} | ${timestamp}\n`; // Format: barcode | timestamp
        console.log(`Data to write: ${dataToWrite}`); // Debugging log

        // Append the data to the file
        fs.appendFile(filePath, dataToWrite, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                return res.status(500).send('Failed to save data');
            }
            console.log('Barcode saved successfully with timestamp.');
            res.send('Data saved');
        });
    } else {
        console.log('No value provided for saving.');
        res.status(400).send('No value provided');
    }
});

// Endpoint to check for duplicate barcodes
app.post('/check-duplicate', (req, res) => {
    const { value } = req.body;
    console.log(`Received request to check duplicate for: ${value}`);
    if (!value) {
        console.log('No value provided for duplicate check.');
        return res.status(400).send({ isDuplicate: false });
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send({ isDuplicate: false });
        }

        console.log('File content:', data); // Debugging file content
        const barcodes = data
            .split('\n') // Split file content into lines
            .map(line => line.split('|')[0].trim()) // Extract only the barcode part (before '|') and trim whitespace
            .filter(line => line !== ''); // Remove empty lines
        console.log('Parsed barcodes:', barcodes); // Debugging parsed barcodes
        const isDuplicate = barcodes.includes(value.trim());
        console.log(`Duplicate check result for ${value}: ${isDuplicate}`);
        res.send({ isDuplicate });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
