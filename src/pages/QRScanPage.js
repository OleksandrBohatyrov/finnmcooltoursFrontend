import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QrReader from 'react-web-qr-reader';

const QRScanPage = ({ token }) => {
  const delay = 500;
  const previewStyle = {
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    display: 'block',
  };

  const [result, setResult] = useState('No result');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleResult = async (data, error) => {
    if (error) {
      return;
    }
    if (data) {
      let uniqueRef;
      if (typeof data === 'object' && data.data) {
        uniqueRef = data.data;
      } else {
        uniqueRef = JSON.stringify(data);
      }
      setResult(uniqueRef);
      setMessage('Scanning...');

      try {
        const res = await fetch('http://62.60.157.133:5000/api/records/checkin-unique', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ uniqueRef }),
        });

        if (res.status === 404) {
          setMessage('Incorrect Reference number.');
          return;
        }
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        const responseData = await res.json();
        setMessage(
          `Success: ${responseData.message}. Passenger: ${responseData.passenger.surname} ${responseData.passenger.firstName}`
        );
      } catch (err) {
        setMessage('Error: ' + err.message);
      }
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner error:', err);
    setMessage('Error accessing camera: ' + err.message);
  };

  // Ensure the component doesn't unmount/remount unnecessarily
  useEffect(() => {
    // Request camera permissions on mount
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .catch((err) => {
        console.error('Camera permission error:', err);
        setMessage('Please allow camera access to scan QR codes.');
      });

    // Cleanup on unmount (optional, if needed)
    return () => {
      // Stop any active camera streams if necessary
    };
  }, []);

  return (
    <div className="container" style={{ textAlign: 'center' }}>
      <h2>QR Scanner</h2>
      {token ? (
        <>
          <p>Point your camera at the QR code to check in the passenger.</p>
          <div style={{ margin: '20px auto' }}>
            <QrReader
              delay={delay}
              style={previewStyle}
              onError={handleError}
              onScan={handleResult} // Fixed prop name
              constraints={{ facingMode: 'environment' }}
              playsInline  // добавляем
                muted 
            />
          </div>
        </>
      ) : (
        <p>Please log in first.</p>
      )}
      <p>QR Data: {result}</p>
      {message && (
        <p style={{ marginTop: '10px', color: message.startsWith('Success') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
      <div style={{ marginTop: '40px' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default QRScanPage;