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

  const [editPaxId, setEditPaxId] = useState(null);
  const [editPaxValue, setEditPaxValue] = useState('');

  const [currentGuide, setCurrentGuide] = useState('');

  const rowRefs = useRef({});
  const [searchTerm, setSearchTerm] = useState('');

  const recordsApiUrl = `${process.env.REACT_APP_API_URL}/api/records?tourType=${encodeURIComponent(tourType)}`;

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/Auth/Me`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setCurrentGuide(data.userName || data.email || '');
      })
      .catch(err => {
        console.error('Error fetching current user:', err);
        setCurrentGuide('Unknown');
      });
  }, []);

  useEffect(() => {
    const loadRecords = () => {
      fetch(recordsApiUrl, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => {
          if (!res.ok) {
            if (res.status === 401) throw new Error('Please log in to view details.');
            throw new Error(`HTTP error: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setRecords(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    };

    loadRecords();

    const intervalId = setInterval(() => {
      loadRecords();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [tourType, recordsApiUrl]);

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

  const markCheckedIn = async id => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/records/${id}/checkin`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      setRecords(prev =>
        prev.map(r =>
          r.id === id ? { ...r, checkedIn: true, checkedInBy: currentGuide } : r
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveCheckIn = passenger => {
    setSelectedPassenger(passenger);
    setDialogOpen(true);
  };

  const confirmRemoveCheckedIn = async () => {
    if (!selectedPassenger) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/records/${selectedPassenger.id}/remove-checkin`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      setRecords(prev =>
        prev.map(r =>
          r.id === selectedPassenger.id ? { ...r, checkedIn: false, checkedInBy: null } : r
        )
      );
    } catch (err) {
      console.error('Error removing check-in:', err);
    } finally {
      setDialogOpen(false);
      setSelectedPassenger(null);
    }
  };

  const handlePaxClick = (id, currentPax) => {
    setEditPaxId(id);
    setEditPaxValue(String(currentPax));
  };

  const handlePaxSave = async () => {
    const newPaxNumber = parseInt(editPaxValue, 10);
    if (isNaN(newPaxNumber) || newPaxNumber < 0) {
      alert('Invalid Pax value');
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/records/${editPaxId}/pax`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pax: newPaxNumber }),
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      setRecords(prev =>
        prev.map(r =>
          r.id === editPaxId ? { ...r, pax: newPaxNumber } : r
        )
      );
    } catch (err) {
      console.error('Error updating pax:', err);
    } finally {
      setEditPaxId(null);
      setEditPaxValue('');
    }
  };

  const handlePaxKeyDown = e => {
    if (e.key === 'Enter') {
      handlePaxSave();
    } else if (e.key === 'Escape') {
      setEditPaxId(null);
      setEditPaxValue('');
    }
  };

  const filteredRecords = records.filter(r => {
    if (!searchTerm.trim()) return true;
    const lowerSearch = searchTerm.toLowerCase();
    const fullName = (r.surname + ' ' + r.firstName).toLowerCase();
    return fullName.includes(lowerSearch);
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  const totalPassengers = filteredRecords.reduce((acc, r) => acc + r.pax, 0);
  const checkedInPassengers = filteredRecords.reduce((acc, r) => acc + (r.checkedIn ? r.pax : 0), 0);
  const myCheckedIn = filteredRecords
    .filter(r => r.checkedIn && r.checkedInBy === currentGuide)
    .reduce((acc, r) => acc + r.pax, 0);

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h1 style={styles.title}>Tour Details: {decodeURIComponent(tourType)}</h1>
        <button style={styles.scanButton} onClick={() => navigate('/qrscan', { state: { tourType } })}>
          Scan QR
        </button>
      </div>

      <div style={styles.summary}>
        <p>Total Passengers: {totalPassengers}</p>
        <p>Checked In: {checkedInPassengers}</p>
        <p>My Checked In: {myCheckedIn}</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search by name or surname..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
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
            {filteredRecords.map(r => (
              <tr
                key={r.id}
                ref={el => (rowRefs.current[r.id] = el)}
                className={String(r.id) === highlightedId ? 'highlighted' : ''}
              >
                <td style={styles.td}>{new Date(r.tourDate).toLocaleDateString()}</td>
                <td style={{ ...styles.td, ...(r.seats === 'Front' ? { backgroundColor: 'yellow' } : {}) }}>
                  {r.surname}
                </td>
                <td style={styles.td}>{r.firstName}</td>
                <td style={{ ...styles.td, ...styles.narrowCol }}>
                  {editPaxId === r.id ? (
                    <input
                      style={styles.paxInput}
                      value={editPaxValue}
                      onChange={e => setEditPaxValue(e.target.value)}
                      onBlur={handlePaxSave}
                      onKeyDown={handlePaxKeyDown}
                      autoFocus
                    />
                  ) : (
                    <span style={{ cursor: 'pointer' }} onClick={() => handlePaxClick(r.id, r.pax)}>
                      {r.pax}
                    </span>
                  )}
                </td>
                <td style={{ ...styles.td, ...styles.narrowCol }}>{r.checkedIn ? 'Yes' : 'No'}</td>
                <td style={{ ...styles.td, ...styles.narrowCol }}>
                  {r.checkedIn ? (
                    <>
                      <button style={styles.removeCheckInBtn} onClick={() => handleRemoveCheckIn(r)}>
                        ✕
                      </button>
                      <span style={{ marginLeft: '0.5rem' }}>{r.checkedInBy}</span>
                    </>
                  ) : (
                    <button style={styles.checkInBtn} onClick={() => markCheckedIn(r.id)}>
                      ✓
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
  summary: {
    marginBottom: '1rem',
    textAlign: 'center',
    fontSize: '1rem',
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
  paxInput: {
    width: '50px',
    textAlign: 'center',
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
