import React, { useEffect, useState } from 'react';

function StatsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = `${process.env.REACT_APP_API_URL}/api/records/stats`;

  useEffect(() => {
    fetch(apiUrl, {
      method: 'GET',
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('401');
          }
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.message === '401') {
          setError('Please log in to view stats.');
        } else {
          setError(err.message);
        }
        setLoading(false);
      });
  }, [apiUrl]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h1>Completed Trips Statistics</h1>
      {stats.length === 0 ? (
        <p>No completed trips found.</p>
      ) : (
        <table className="records-table">
          <thead>
            <tr>
              <th>Tour Date</th>
              <th>Tour Type</th>
              <th>Total Clients</th>
              <th>Checked In</th>
              <th>Not Arrived</th>
              <th>Guide name</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, idx) => (
              <tr key={idx}>
                <td>{new Date(s.tourDate).toLocaleDateString()}</td>
                <td>{s.tourType}</td>
                <td>{s.totalClients}</td>
                <td>{s.checkedInCount}</td>
                <td>{s.notArrivedCount}</td>
                <td>{s.guideName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StatsPage;
