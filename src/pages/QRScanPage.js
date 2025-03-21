import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import QrReader from 'react-web-qr-reader';

function QRScanPage({ token }) {
  const [message, setMessage] = useState('');
  const [scannedPassenger, setScannedPassenger] = useState(null);
  const [uniqueRef, setUniqueRef] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Получаем tourType из state
  const { tourType } = location.state || {};

  const delay = 500;

  const previewStyle = {
    width: '50%',
    maxWidth: '400px',
    margin: '0 auto',
    display: 'block',
  };

  const handleResult = async (data, error) => {
    if (error) {
      console.error('QR scan error:', error);
      setMessage('Error scanning QR code: ' + error.message);
      return;
    }
    if (data) {
      let ref = '';
      if (typeof data === 'object' && data.data) {
        ref = data.data;
      } else {
        ref = String(data);
      }
      console.log('Scanned QR code:', ref); // Для отладки
      setUniqueRef(ref);
      setMessage('Scanning...');
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/records/checkin-unique`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ uniqueRef: ref }),
        });
        if (res.status === 404) {
          setMessage('Passenger not found.');
          return;
        }
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        const responseData = await res.json();
        console.log('API response:', responseData); // Для отладки
        setScannedPassenger(responseData.passenger);
        setMessage(`Success: ${responseData.message}`);
      } catch (err) {
        console.error('Fetch error:', err);
        setMessage('Error: ' + err.message);
      }
    }
  };

  const handleBack = () => {
    console.log('handleBack called, tourType:', tourType, 'scannedPassenger:', scannedPassenger); // Для отладки
    if (scannedPassenger && tourType) {
      // Формируем правильный URL с tourType
      const url = `/tour/${encodeURIComponent(tourType)}?highlighted=${scannedPassenger.id}`;
      console.log('Navigating to:', url); // Для отладки
      navigate(url);
    } else {
      console.log('Navigating back (no scannedPassenger or tourType)');
      navigate(-1);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>QR Scanner</h2>
      <p style={styles.instructions}>Point your camera at the QR code to check in the passenger.</p>
      <div style={styles.scannerWrapper}>
        <QrReader
          delay={delay}
          style={previewStyle}
          onScan={handleResult}
          constraints={{ facingMode: 'environment' }}
        />
      </div>

      {uniqueRef && <p style={styles.refText}>QR Data: {uniqueRef}</p>}
      {scannedPassenger && (
        <div style={styles.passengerInfo}>
          <p>
            Passenger: {scannedPassenger.surname} {scannedPassenger.firstName}
          </p>
        </div>
      )}
      {message && (
        <p style={message.startsWith('Success') ? styles.success : styles.error}>{message}</p>
      )}

      <button style={styles.backButton} onClick={handleBack}>
        Go Back
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: '0 auto',
    padding: '1rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.5rem',
  },
  instructions: {
    fontSize: '1rem',
    marginBottom: '1rem',
  },
  scannerWrapper: {
    marginBottom: '1rem',
  },
  refText: {
    fontSize: '1rem',
    margin: '0.5rem 0',
  },
  passengerInfo: {
    fontSize: '1rem',
    fontWeight: 'bold',
    margin: '0.5rem 0',
  },
  success: {
    color: 'green',
    marginTop: '1rem',
  },
  error: {
    color: 'red',
    marginTop: '1rem',
  },
  backButton: {
    marginTop: '2rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
  },
};

export default QRScanPage;