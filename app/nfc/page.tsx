'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Use a more generic interface for the Web NFC API available on window
interface NDEFReader {
  scan(options?: { signal: AbortSignal }): Promise<void>;
  addEventListener(type: string, listener: (event: any) => void): void;
}

declare global {
  interface Window {
    NDEFReader: any;
  }
}

export const NfcScanner: React.FC = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('Checking support...');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [records, setRecords] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setIsSupported(true);
      setStatus('Ready. Click "Start Scanning".');
    } else {
      setIsSupported(false);
      setStatus('Web NFC not found. Use Chrome for Android.');
      console.error('NDEFReader is not defined in window');
    }
  }, []);

  const startScan = useCallback(async () => {
    try {
      setStatus('Initializing NDEFReader...');
      const ndef = new window.NDEFReader();

      abortControllerRef.current = new AbortController();

      // Register event listeners BEFORE calling scan()
      ndef.addEventListener('reading', (event: any) => {
        const { message, serialNumber } = event;
        setSerialNumber(serialNumber || 'Unknown');
        setStatus('Tag read!');

        const newRecords: string[] = [];
        for (const record of message.records) {
            // ... (keep the same decoding logic)
            newRecords.push(`Type: ${record.recordType}`);
        }
        setRecords(newRecords);
      });

      ndef.addEventListener('readingerror', () => {
        setStatus('Error reading tag.');
      });

      setStatus('Requesting permission...');
      await ndef.scan({ signal: abortControllerRef.current.signal });

      setIsScanning(true);
      setStatus('Scanning... Please tap a tag.');
    } catch (error: any) {
      console.error('Scan error:', error);
      setStatus(`Error: ${error.message || error}`);
      setIsScanning(false);
    }
  }, []);

  const stopScan = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsScanning(false);
    setStatus('Stopped.');
  }, []);

  // ... (rest of the component)

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <main style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Web NFC Scanner</h2>
        <p style={{ color: 'red' }}>{status}</p>
        <p>Web NFC is currently only supported on Chrome for Android.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>Web NFC Scanner</h2>

      <div style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        {!isScanning ? (
          <button
            onClick={startScan}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScan}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Stop Scanning
          </button>
        )}
      </div>

      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #dee2e6'
      }}>
        <p><strong>Status:</strong> {status}</p>
        {serialNumber && (
          <p><strong>Serial Number:</strong> <code>{serialNumber}</code></p>
        )}

        {records.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <strong>Records:</strong>
            <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
              {records.map((rec, index) => (
                <li key={index} style={{ marginBottom: '5px' }}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Start Scanning".</li>
          <li>Grant NFC permission if prompted.</li>
          <li>Hold an NFC tag near the back of your smartphone.</li>
        </ol>
      </div>
    </main>
  );
};

export default NfcScanner;
