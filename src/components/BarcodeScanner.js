import React, { useState, useEffect, useRef } from 'react';

const BarcodeScanner = ({ onScan, onClose, isOpen }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const [scanMode, setScanMode] = useState('barcode'); // 'barcode' or 'qr'
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const quaggaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, scanMode]);

  const startCamera = async () => {
    try {
      setError('');
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Initialize QuaggaJS for real barcode scanning
      if (scanMode === 'barcode') {
        initializeQuagga();
      } else {
        // For QR codes, use a simple detection method
        setTimeout(scanBarcode, 1000);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera access or enter code manually.');
      setIsScanning(false);
    }
  };

  const initializeQuagga = () => {
    if (typeof window !== 'undefined' && window.Quagga) {
      window.Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          }
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader"
          ]
        }
      }, (err) => {
        if (err) {
          console.log('QuaggaJS initialization failed:', err);
          // Fallback to simple scanning
          setTimeout(scanBarcode, 1000);
          return;
        }
        console.log("QuaggaJS initialization finished. Ready to start");
        window.Quagga.start();
        
        // Listen for successful barcode detection
        window.Quagga.onDetected((data) => {
          const code = data.codeResult.code;
          if (code && code.length > 0) {
            handleSuccessfulScan(code);
          }
        });
      });
    } else {
      // Fallback if QuaggaJS is not available
      setTimeout(scanBarcode, 1000);
    }
  };

  const stopCamera = () => {
    if (window.Quagga && quaggaRef.current) {
      window.Quagga.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const scanBarcode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Simple pattern recognition for demo
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // For QR codes, you would implement QR detection here
    if (scanMode === 'qr') {
      // Simulate QR code detection
      // In real implementation, use jsQR library
    }
    
    // Continue scanning
    if (isScanning) {
      setTimeout(scanBarcode, 100);
    }
  };

  const handleSuccessfulScan = (code) => {
    // Add to scan history
    const scanEntry = {
      code: code,
      timestamp: new Date().toLocaleTimeString(),
      type: scanMode
    };
    setScanHistory(prev => [scanEntry, ...prev.slice(0, 4)]); // Keep last 5 scans
    
    // Call the onScan callback
    onScan(code);
    
    // Visual feedback
    setError('');
    
    // Auto-close after successful scan (optional)
    // setTimeout(() => onClose(), 1000);
  };

  const handleManualEntry = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleSuccessfulScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const generateTestBarcode = () => {
    const testBarcodes = [
      '1234567890123',
      '9876543210987',
      '5555555555555',
      '1111111111111',
      '7890123456789'
    ];
    const randomBarcode = testBarcodes[Math.floor(Math.random() * testBarcodes.length)];
    handleSuccessfulScan(randomBarcode);
  };

  const generateTestQRCode = () => {
    const testQRCodes = [
      'QR:PRODUCT:001',
      'QR:CUSTOMER:12345',
      'QR:DISCOUNT:SAVE20',
      'QR:LOYALTY:GOLD123'
    ];
    const randomQR = testQRCodes[Math.floor(Math.random() * testQRCodes.length)];
    handleSuccessfulScan(randomQR);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Scan {scanMode === 'barcode' ? 'Barcode' : 'QR Code'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Scan Mode Toggle */}
        <div className="mb-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setScanMode('barcode')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                scanMode === 'barcode'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Barcode
            </button>
            <button
              onClick={() => setScanMode('qr')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                scanMode === 'qr'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔲 QR Code
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Camera View */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <video 
              ref={videoRef}
              className="w-full h-48 object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas 
              ref={canvasRef}
              className="hidden"
            />
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`border-2 border-red-500 border-dashed bg-transparent ${
                  scanMode === 'barcode' ? 'w-48 h-16' : 'w-32 h-32'
                }`}>
                  <div className="text-center text-red-500 text-sm mt-2">
                    Align {scanMode} here
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Scans:</h4>
              <div className="space-y-1">
                {scanHistory.map((scan, index) => (
                  <div key={index} className="flex justify-between text-xs text-gray-600">
                    <span className="font-mono">{scan.code}</span>
                    <span>{scan.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual Entry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or enter {scanMode} manually:
            </label>
            <form onSubmit={handleManualEntry} className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder={`Enter ${scanMode} number`}
                className="form-input flex-1"
              />
              <button 
                type="submit"
                className="btn btn-primary"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Test Buttons */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">For testing purposes:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={generateTestBarcode}
                className="btn btn-secondary"
              >
                📊 Test Barcode
              </button>
              <button
                onClick={generateTestQRCode}
                className="btn btn-secondary"
              >
                🔲 Test QR Code
              </button>
            </div>
          </div>

          {/* Scanner Controls */}
          <div className="flex gap-2">
            <button
              onClick={startCamera}
              className="btn btn-outline flex-1"
              disabled={isScanning}
            >
              {isScanning ? 'Scanning...' : 'Start Camera'}
            </button>
            <button
              onClick={stopCamera}
              className="btn btn-outline flex-1"
              disabled={!isScanning}
            >
              Stop Camera
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner; 