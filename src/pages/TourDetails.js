import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AlertDialog from '../components/AlertDialog';
import '../styles/TourDetails.css';

function TourDetails() {
  const { tourType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const highlightedId = params.get('highlighted');

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState(null);

  // Guide name state
  const [guideName, setGuideName] = useState('');
  const [guideMessage, setGuideMessage] = useState('');

  const rowRefs = useRef({});

  const recordsApiUrl = `${process.env.REACT_APP_API_URL}/api/records?tourType=${encodeURIComponent(tourType)}`;
  const tourApiUrl = `${process.env.REACT_APP_API_URL}/api/tours/byType?tourType=${encodeURIComponent(tourType)}`;

  // search bar state
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(recordsApiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Please log in to view details.');
          }
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [tourType, recordsApiUrl]);

  useEffect(() => {
    fetch(tourApiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (res.status === 404) {
          setGuideName('');
          return null;
        }
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((tourData) => {
        if (tourData) {
          setGuideName(tourData.guideName || '');
        }
      })
      .catch((err) => {
        console.error('Error fetching tour:', err);
      });
  }, [tourApiUrl]);

  useEffect(() => {
    if (highlightedId && records.length > 0) {
      const highlightedRow = rowRefs.current[highlightedId];
      if (highlightedRow) {
        highlightedRow.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [highlightedId, records]);

  const updateGuideName = async () => {
    if (!guideName.trim()) {
      setGuideMessage('Please enter a valid guide name.');
      return;
    }
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/tours/guide?tourType=${encodeURIComponent(tourType)}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ guideName }),
        }
      );
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const updatedTour = await res.json();
      setGuideMessage(`Guide name updated to: ${updatedTour.guideName}`);
    } catch (err) {
      console.error('Error updating guide name:', err);
      setGuideMessage('Error updating guide name: ' + err.message);
    }
  };

  // Passenger check-in
  const markCheckedIn = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/records/${id}/checkin`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, checkedIn: true } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Dialog remove check-in
  const handleRemoveCheckIn = (passenger) => {
    setSelectedPassenger(passenger);
    setDialogOpen(true);
  };

  const confirmRemoveCheckedIn = async () => {
    if (!selectedPassenger) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/records/${selectedPassenger.id}/remove-checkin`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      setRecords((prev) =>
        prev.map((r) =>
          r.id === selectedPassenger.id ? { ...r, checkedIn: false } : r
        )
      );
    } catch (err) {
      console.error('Error removing check-in:', err);
    } finally {
      setDialogOpen(false);
      setSelectedPassenger(null);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (!searchTerm.trim()) return true;
    const lowerSearch = searchTerm.toLowerCase();
    const fullName = (r.surname + ' ' + r.firstName).toLowerCase();
    return fullName.includes(lowerSearch);
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}> 
        <h1 style={styles.title}>Tour Details: {decodeURIComponent(tourType)}</h1>
        <button style={styles.scanButton} onClick={() => navigate('/qrscan', { state: { tourType } })}>
          Scan QR
        </button>
      </div>

      <div style={styles.guideSection}>
        <label style={styles.guideLabel}>Guide Name: </label>
        <input
          type="text"
          value={guideName}
          onChange={(e) => setGuideName(e.target.value)}
          style={styles.guideInput}
          placeholder="Enter guide name"
        />
        <button style={styles.saveGuideBtn} onClick={updateGuideName}>
          Save Guide
        </button>
        {guideMessage && <p style={styles.guideMessage}>{guideMessage}</p>}
      </div>

      <div className="search-container">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search by name or surname..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <i className="fas fa-search search-icon"></i>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tour Date</th>
              <th style={styles.th}>Surname</th>
              <th style={styles.th}>First Name</th>
              <th style={{ ...styles.th, ...styles.narrowCol }}>Pax</th>
              <th style={{ ...styles.th, ...styles.narrowCol }}>Checked</th>
              <th style={{ ...styles.th, ...styles.narrowCol }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r) => (
              <tr
                key={r.id}
                ref={(el) => (rowRefs.current[r.id] = el)}
                className={String(r.id) === highlightedId ? 'highlighted' : ''}
              >
                <td style={styles.td}>{new Date(r.tourDate).toLocaleDateString()}</td>
                {/* Если r.seats === "Front", подсвечиваем ячейку фамилии */}
                <td
                  style={{
                    ...styles.td,
                    ...(r.seats === 'Front' ? { backgroundColor: 'yellow' } : {}),
                  }}
                >
                  {r.surname}
                </td>
                <td style={styles.td}>{r.firstName}</td>
                <td style={{ ...styles.td, ...styles.narrowCol }}>{r.pax}</td>
                <td style={{ ...styles.td, ...styles.narrowCol }}>
                  {r.checkedIn ? 'Yes' : 'No'}
                </td>
                <td style={{ ...styles.td, ...styles.narrowCol }}>
                  {!r.checkedIn ? (
                    <button style={styles.checkInBtn} onClick={() => markCheckedIn(r.id)}>
                      ✓
                    </button>
                  ) : (
                    <button style={styles.removeCheckInBtn} onClick={() => handleRemoveCheckIn(r)}>
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmRemoveCheckedIn}
        passengerName={selectedPassenger ? `${selectedPassenger.surname} ${selectedPassenger.firstName}` : ''}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '1rem',
    fontFamily: 'Arial, sans-serif',
    boxSizing: 'border-box',
  },
  headerRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: '1rem',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    marginRight: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.2rem',
    textAlign: 'center',
    flex: 1,
  },
  scanButton: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    marginLeft: '1rem',
  },
  guideSection: {
    marginBottom: '1rem',
    textAlign: 'center',
  },
  guideLabel: {
    marginRight: '0.5rem',
    fontSize: '1rem',
  },
  guideInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    width: '60%',
    maxWidth: '300px',
  },
  saveGuideBtn: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    marginLeft: '0.5rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
  guideMessage: {
    marginTop: '0.5rem',
    fontSize: '0.9rem',
  },
  tableWrapper: {
    overflowX: 'auto',
    width: '100%',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '0.5rem',
    border: '1px solid #ddd',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  narrowCol: {
    width: '70px',
    textAlign: 'center',
    padding: '0.3rem',
  },
  checkInBtn: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    padding: '0.3rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  removeCheckInBtn: {
    backgroundColor: '#ffc107',
    color: '#000',
    border: 'none',
    padding: '0.3rem 0.5rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
};

export default TourDetails;
