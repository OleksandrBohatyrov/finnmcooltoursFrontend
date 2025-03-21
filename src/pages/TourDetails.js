import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import AlertDialog from '../components/AlertDialog';
import '../styles/TourDetails.css';

function TourDetails({ token }) {
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

  const rowRefs = useRef({});

  const apiUrl = `${process.env.REACT_APP_API_URL}/records?tourType=${encodeURIComponent(tourType)}`;

  useEffect(() => {
    if (!token) {
      setError('Please log in to view details.');
      setLoading(false);
      return;
    }
    console.log('Fetching records from:', apiUrl);
    fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
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
  }, [tourType, apiUrl, token]);

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

  const markCheckedIn = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/records/${id}/checkin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, checkedIn: true } : r)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveCheckIn = (passenger) => {
    console.log('Opening dialog for passenger:', passenger);
    setSelectedPassenger(passenger);
    setDialogOpen(true);
  };

  const confirmRemoveCheckedIn = async () => {
    if (!selectedPassenger) return;

    try {
      console.log('Removing check-in for passenger:', selectedPassenger.id);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/records/${selectedPassenger.id}/remove-checkin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      setRecords((prev) =>
        prev.map((r) => (r.id === selectedPassenger.id ? { ...r, checkedIn: false } : r))
      );
    } catch (err) {
      console.error('Error removing check-in:', err);
    } finally {
      setDialogOpen(false);
      setSelectedPassenger(null);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (error) return <div style={styles.error}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          Go Back
        </button>
        <h1 style={styles.title}>Tour Details: {decodeURIComponent(tourType)}</h1>
        <button
          style={styles.scanButton}
          onClick={() => navigate('/qrscan', { state: { tourType } })} // Передаём tourType через state
        >
          Scan QR
        </button>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Tour Date</th>
              <th style={styles.th}>Surname</th>
              <th style={styles.th}>First Name</th>
              <th style={styles.th}>Pax</th>
              <th style={styles.th}>Unique Ref</th>
              <th style={styles.th}>Checked In</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const isHighlighted = highlightedId && r.id.toString() === highlightedId;
              return (
                <tr
                  key={r.id}
                  ref={(el) => (rowRefs.current[r.id] = el)}
                  style={{
                    ...(isHighlighted
                      ? {
                          backgroundColor: '#ffefcc',
                          border: '2px solid #ff9900',
                          animation: 'blink 1s ease-in-out 3',
                        }
                      : {}),
                  }}
                >
                  <td style={styles.td}>{new Date(r.tourDate).toLocaleDateString()}</td>
                  <td style={styles.td}>{r.surname}</td>
                  <td style={styles.td}>{r.firstName}</td>
                  <td style={styles.td}>{r.pax}</td>
                  <td style={styles.td}>{r.uniqueReference}</td>
                  <td style={styles.td}>{r.checkedIn ? 'Yes' : 'No'}</td>
                  <td style={styles.td}>
                    {!r.checkedIn ? (
                      <button style={styles.checkInBtn} onClick={() => markCheckedIn(r.id)}>
                        Check In
                      </button>
                    ) : (
                      <button
                        style={styles.removeCheckInBtn}
                        onClick={() => handleRemoveCheckIn(r)}
                      >
                        Remove Check In
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AlertDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmRemoveCheckedIn}
        passengerName={
          selectedPassenger ? `${selectedPassenger.surname} ${selectedPassenger.firstName}` : ''
        }
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
  loading: {
    textAlign: 'center',
    marginTop: '2rem',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: '2rem',
  },
};

export default TourDetails;
=======
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function TourDetails({ token }) {
	const { tourType } = useParams()
	const navigate = useNavigate()

	const [records, setRecords] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	const apiUrl = `https://api.abkillio.xyz/api/records?tourType=${encodeURIComponent(tourType)}`

	useEffect(() => {
		if (!token) {
			setError('Please log in to view details.')
			setLoading(false)
			return
		}
		fetch(apiUrl, {
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		})
			.then(res => {
				if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
				return res.json()
			})
			.then(data => {
				setRecords(data)
				setLoading(false)
			})
			.catch(err => {
				setError(err.message)
				setLoading(false)
			})
	}, [tourType, apiUrl, token])

	// Mark passenger as CheckedIn
	const markCheckedIn = async id => {
		try {
			const res = await fetch(`https://api.abkillio.xyz/api/records/${id}/checkin`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
			})
			if (!res.ok) throw new Error(`HTTP error: ${res.status}`)

			setRecords(prev => prev.map(r => (r.id === id ? { ...r, checkedIn: true } : r)))
		} catch (err) {
			console.error(err)
		}
	}

	const removeCheckedIn = async id => {
		try {
			const res = await fetch(`https://api.abkillio.xyz/api/records/${id}/remove-checkin`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
			})
			if (!res.ok) throw new Error(`HTTP error: ${res.status}`)

			setRecords(prev => prev.map(r => (r.id === id ? { ...r, checkedIn: false } : r)))
		} catch (err) {
			console.error(err)
		}
	}

	if (loading) return <div>Loading...</div>
	if (error) return <div>Error: {error}</div>

	return (
		<div className='container'>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<h1 style={{ margin: 0 }}>Tour Details: {decodeURIComponent(tourType)}</h1>
				{/* Button Scan QR */}
				<button className='btn btn-primary' onClick={() => navigate('/qrscan')} style={{ marginLeft: '20px' }}>
					Scan QR
				</button>
			</div>

			<table className='records-table' style={{ marginTop: '20px' }}>
				<thead>
					<tr>
						<th>ID</th>
						<th>Tour Date</th>
						<th>Surname</th>
						<th>First Name</th>
						<th>Pax</th>
						<th>Unique Ref</th>
						<th>Checked In</th>
						<th>Action</th>
					</tr>
				</thead>
				<tbody>
					{records.map(r => (
						<tr key={r.id}>
							<td>{r.id}</td>
							<td>{new Date(r.tourDate).toLocaleDateString()}</td>
							<td>{r.surname}</td>
							<td>{r.firstName}</td>
							<td>{r.pax}</td>
							<td>{r.uniqueReference}</td>
							<td>{r.checkedIn ? 'Yes' : 'No'}</td>
							<td>
								{!r.checkedIn ? (
									<button className='btn btn-success' onClick={() => markCheckedIn(r.id)}>
										Check In
									</button>
								) : (
									<button className='btn btn-warning' onClick={() => removeCheckedIn(r.id)}>
										Remove Check In
									</button>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default TourDetails