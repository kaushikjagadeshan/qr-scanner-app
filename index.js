document.addEventListener("DOMContentLoaded", () => {
    const barcodeInput = document.getElementById("barcodeInput");
    const output = document.getElementById("output");
    const partNumbers = document.getElementById("partNumbers");
    const selectedPartNo = document.getElementById("selectedPartNo");
    const mainBody = document.getElementById("mainBody");
    const resetButton = document.getElementById("resetButton");
    const alertContainer = document.getElementById("alertContainer");

    let currentPartNo = "";
    let audioContext = null; // To manage the audio context for continuous beep
    let oscillator = null; // To manage the oscillator for continuous beep
    let beepInterval = null; // To manage interval-based beeping for red

    // Function to start a single short beep sound
    function playShortBeep(frequency, duration) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); // Frequency in Hz
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
            audioContext.close();
        }, duration); // Duration in milliseconds
    }

    // Function to start interval-based beeping
    function startIntervalBeep(frequency, onDuration, offDuration) {
        if (!beepInterval) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); // Frequency in Hz
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            let isBeeping = false;
            beepInterval = setInterval(() => {
                if (isBeeping) {
                    oscillator.stop();
                    isBeeping = false;
                } else {
                    oscillator = audioContext.createOscillator();
                    oscillator.type = "sine";
                    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                    oscillator.connect(gainNode);
                    oscillator.start();
                    isBeeping = true;
                }
            }, onDuration + offDuration);
        }
    }

    // Function to stop interval-based beeping
    function stopIntervalBeep() {
        if (beepInterval) {
            clearInterval(beepInterval);
            beepInterval = null;
        }
        if (oscillator) {
            oscillator.stop();
            oscillator = null;
        }
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
    }

    // Function to display Bootstrap alerts
    function showAlert(message, type) {
        const alert = document.createElement("div");
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.role = "alert";
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.appendChild(alert);

        // Automatically remove the alert after 5 seconds
        setTimeout(() => {
            alert.classList.remove("show");
            alert.classList.add("hide");
            alert.addEventListener("transitionend", () => alert.remove());
        }, 5000);
    }

    // Update displayed part number when a selection is made
    partNumbers.addEventListener("change", () => {
        currentPartNo = partNumbers.value;
        selectedPartNo.textContent = `Part No: ${currentPartNo}`;
        console.log(`Selected Part No: ${currentPartNo}`);
    });

    barcodeInput.addEventListener("input", async () => {
        const barcode = barcodeInput.value;
        console.log(`Input Barcode: ${barcode}`);

        // Process only if the barcode is 18 digits long
        if (barcode.length !== 18) {
            console.log("Barcode length is not 18. Ignoring input.");
            output.textContent = ""; // Clear the displayed scanned data
            return;
        }

        // Extract parts of the barcode
        const partNo = barcode.slice(0, 8); // First 8 characters
        const date = barcode.slice(8, 14); // Next 6 characters
        const sequence = barcode.slice(14); // Remaining characters
        const formattedDate = `${date.slice(0, 2)}-${date.slice(2, 4)}-${date.slice(4)}`; // Format date as DD-MM-YY
        console.log(`Extracted Part No: ${partNo}, Date: ${formattedDate}, Sequence: ${sequence}`);

        // Display formatted scanned data at the top
        output.innerHTML = `Part No: ${partNo} &nbsp;&nbsp; Date: ${formattedDate} &nbsp;&nbsp; Serial No: ${sequence}`;

        // Validate part number
        if (partNo !== currentPartNo) {
            console.log(`Part number mismatch! Scanned: ${partNo}, Expected: ${currentPartNo}`);
            mainBody.className = "d-flex flex-column justify-content-center align-items-center vh-100 bg-danger";
            barcodeInput.disabled = true; // Disable input field
            resetButton.classList.remove("d-none"); // Show reset button
            showAlert(`Part number mismatch! Scanned: ${partNo}, Expected: ${currentPartNo}`, "danger");
            startIntervalBeep(400, 500, 500); // Start interval-based error beep
            return;
        }

        // Check for duplicate barcode
        try {
            const isDuplicate = await checkDuplicate(barcode);
            console.log(`Duplicate Check Result: ${isDuplicate}`);
            if (isDuplicate) {
                mainBody.className = "d-flex flex-column justify-content-center align-items-center vh-100 bg-danger";
                barcodeInput.disabled = true; // Disable input field
                resetButton.classList.remove("d-none"); // Show reset button
                showAlert(`Duplicate barcode detected: ${barcode}`, "danger");
                startIntervalBeep(300, 500, 500); // Start interval-based duplicate beep
                return;
            }
        } catch (err) {
            console.error('Error during duplicate check:', err);
        }

        // If validation passes
        console.log("Validation passed. Barcode is unique.");
        mainBody.className = "d-flex flex-column justify-content-center align-items-center vh-100 bg-success";
        barcodeInput.disabled = true; // Disable input field
        resetButton.classList.add("d-none"); // Hide reset button
        showAlert("Barcode is valid and saved successfully!", "success");
        playShortBeep(600, 200); // Play short success beep

        // Send the barcode to the server to save in a file
        fetch('/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: barcode })
        }).then(() => console.log("Barcode saved successfully."))
          .catch(err => console.error('Error saving data:', err));

        // Clear input and reset background after 3 seconds
        setTimeout(() => {
            console.log("Resetting background to yellow after success.");
            mainBody.className = "d-flex flex-column justify-content-center align-items-center vh-100 bg-warning"; // Reset background to yellow
            barcodeInput.disabled = false; // Enable input field
            barcodeInput.value = ""; // Clear the input field
            barcodeInput.focus(); // Focus on the input field
            output.textContent = ""; // Clear the displayed scanned data
            alertContainer.innerHTML = ""; // Clear any remaining alerts
        }, 3000);
    });

    // Reset button functionality
    resetButton.addEventListener("click", () => {
        console.log("Reset button clicked. Resetting background and input.");
        mainBody.className = "d-flex flex-column justify-content-center align-items-center vh-100 bg-warning"; // Reset background to yellow
        barcodeInput.disabled = false; // Enable input field
        barcodeInput.focus(); // Focus on the input field
        resetButton.classList.add("d-none"); // Hide reset button
        barcodeInput.value = ""; // Clear the input field
        output.textContent = ""; // Clear the displayed scanned data
        stopIntervalBeep(); // Stop interval-based beeping
        alertContainer.innerHTML = ""; // Clear any remaining alerts
    });

    barcodeInput.focus(); // Ensure the input is focused for scanning on page load

    // Function to check if the barcode already exists in the file
    async function checkDuplicate(barcode) {
        try {
            console.log(`Sending request to check duplicate for: ${barcode}`);
            const response = await fetch('/check-duplicate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: barcode })
            });

            if (!response.ok) {
                console.error(`Error: Received status ${response.status} from server.`);
                return false;
            }

            const result = await response.json();
            console.log(`Server Response: ${JSON.stringify(result)}`);
            return result.isDuplicate;
        } catch (err) {
            console.error('Error checking duplicate:', err);
            return false;
        }
    }
});
