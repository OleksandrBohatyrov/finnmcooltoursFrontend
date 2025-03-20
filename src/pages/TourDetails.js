import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function TourDetails({ token }) {
  const { tourType } = useParams();
  const navigate = useNavigate(); // нужен для перехода по кнопке

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL, чтобы получить список пассажиров по TourType
  const apiUrl = `https://localhost:7246/api/records?tourType=${encodeURIComponent(tourType)}`;

  useEffect(() => {
    if (!token) {
      setError("Please log in to view details.");
      setLoading(false);
      return;
    }
    fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
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
  }, [tourType, apiUrl, token]);

  // Отмечаем пассажира как CheckedIn
  const markCheckedIn = async (id) => {
    try {
      const res = await fetch(`https://localhost:7246/api/records/${id}/checkin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      setRecords(prev => prev.map(r => r.id === id ? { ...r, checkedIn: true } : r));
    } catch (err) {
      console.error(err);
    }
  };

  // Снимаем отметку CheckedIn
  const removeCheckedIn = async (id) => {
    try {
      const res = await fetch(`https://localhost:7246/api/records/${id}/remove-checkin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      setRecords(prev => prev.map(r => r.id === id ? { ...r, checkedIn: false } : r));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Заголовок и кнопка сканера в одной строке */}
        <h1 style={{ margin: 0 }}>
          Tour Details: {decodeURIComponent(tourType)}
        </h1>
        {/* Кнопка Scan QR */}
        <button
          className="btn btn-primary"
          onClick={() => navigate('/qrscan')}
          style={{ marginLeft: '20px' }}
        >
          Scan QR
        </button>
      </div>

      <table className="records-table" style={{ marginTop: '20px' }}>
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
              <td>{r.checkedIn ? "Yes" : "No"}</td>
              <td>
                {!r.checkedIn ? (
                  <button className="btn btn-success" onClick={() => markCheckedIn(r.id)}>
                    Check In
                  </button>
                ) : (
                  <button className="btn btn-warning" onClick={() => removeCheckedIn(r.id)}>
                    Remove Check In
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TourDetails;
