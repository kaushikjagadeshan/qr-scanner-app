import React, { useState, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const OCRQRScanner = () => {
  const partNumbers = ["28809262", "28805418", "28809263", "28805417"];
  const [inputPartNo, setInputPartNo] = useState(partNumbers[0]);
  const [scannedCode, setScannedCode] = useState("");
  const [status, setStatus] = useState("white");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const codeReaderRef = useRef(new BrowserMultiFormatReader());

  // 📌 Start QR Scanning
  const startScanning = async () => {
    try {
      setIsScanning(true);
      setScannedCode("");
      setStatus("white");

      stopScanning(); // Ensure any previous scan is stopped

      const codeReader = codeReaderRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result) {
          handleScan(result.text);
        }
      });
    } catch (error) {
      console.error("Error starting scanner:", error);
    }
  };

  // 📌 Handle QR Code Scan Result
  const handleScan = (code) => {
    console.log("Processing scanned QR:", code);

    const scannedFirst8 = String(code).trim().slice(0, 8);
    const enteredFirst8 = String(inputPartNo).trim().slice(0, 8);

    setScannedCode(code);

    if (scannedFirst8 === enteredFirst8) {
      setStatus("green");
      console.log("✅ First 8 digits matched! Turning GREEN...");

      setTimeout(() => {
        setStatus("yellow");
        console.log("🔶 Changing to YELLOW (part taken)...");
      }, 2000);
    } else {
      setStatus("red");
      console.warn("❌ First 8 digits DID NOT match! Turning RED...");
      alert(`Mismatch! Expected: ${enteredFirst8}, Scanned: ${scannedFirst8}`);
    }
  };

  // 📌 Stop Scanning Properly
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop()); // Stop camera stream
      streamRef.current = null;
      console.log("📷 Camera stream stopped.");
    }

    setIsScanning(false);
    setScannedCode("");
    setStatus("white");
  };

  return (
    <div style={{ textAlign: "center", backgroundColor: status, height: "100vh", paddingTop: "20px" }}>
      <h2>QR Code Scanner</h2>

      {/* Dropdown for Selecting Part Number */}
      <select
        value={inputPartNo}
        onChange={(e) => {
          stopScanning(); // Stop scanning when part number changes
          setInputPartNo(e.target.value);
        }}
        style={{ padding: "10px", fontSize: "16px", marginBottom: "10px" }}
      >
        {partNumbers.map((part, index) => (
          <option key={index} value={part}>
            {part}
          </option>
        ))}
      </select>

      <br />

      {/* Video Feed */}
      <video ref={videoRef} style={{ width: "80%", maxWidth: "400px", margin: "10px 0" }} autoPlay />

      <br />

      {/* Buttons */}
      {!isScanning ? (
        <button onClick={startScanning} style={{ padding: "10px 20px", fontSize: "18px", marginRight: "10px" }}>
          Start Inspection
        </button>
      ) : (
        <button onClick={stopScanning} style={{ padding: "10px 20px", fontSize: "18px", backgroundColor: "red", color: "white" }}>
          Stop Inspection
        </button>
      )}

      {/* Scanned Code Display */}
      <p><strong>Scanned Code:</strong> {scannedCode}</p>
    </div>
  );
};

export default OCRQRScanner;
