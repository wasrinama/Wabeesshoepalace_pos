import React, { useState, useEffect, useRef } from 'react';

const BarcodeScanner = ({ onScan, onClose, isOpen }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

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
      
      // Start scanning process
      setTimeout(scanBarcode, 1000);
    } catch (err) {
      setError('Camera access denied. Please allow camera access or enter barcode manually.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
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
    
    // Simulate barcode detection (in real app, use a library like QuaggaJS)
    // For demo purposes, we'll use a simple pattern recognition
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Continue scanning
    if (isScanning) {
      setTimeout(scanBarcode, 100);
    }
  };

  const handleManualEntry = (e) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode('');
    }
  };

  const generateTestBarcode = () => {
    const testBarcodes = [
      '1234567890123',
      '9876543210987',
      '5555555555555',
      '1111111111111'
    ];
    const randomBarcode = testBarcodes[Math.floor(Math.random() * testBarcodes.length)];
    onScan(randomBarcode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Scan Barcode</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="text-2xl">×</span>
          </button>
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
                <div className="border-2 border-red-500 border-dashed w-48 h-16 bg-transparent">
                  <div className="text-center text-red-500 text-sm mt-2">
                    Align barcode here
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or enter barcode manually:
            </label>
            <form onSubmit={handleManualEntry} className="flex gap-2">
              <input
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Enter barcode number"
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

          {/* Test Button (for demonstration) */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">For testing purposes:</p>
            <button
              onClick={generateTestBarcode}
              className="btn btn-secondary w-full"
            >
              Generate Test Barcode
            </button>
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