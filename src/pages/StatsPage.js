import React, { useEffect, useState } from 'react';

function StatsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

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
            throw new Error('Please log in to view stats.');
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
        if (err.message === 'Please log in to view stats.') {
          setError('Please log in to view stats.');
        } else {
          setError(err.message);
        }
        setLoading(false);
      });
  }, [apiUrl]);

  const toggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h1>Completed Trips Statistics</h1>
      {stats.length === 0 ? (
        <p>No completed trips found.</p>
      ) : (
        <table className="records-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Tour Date</th>
              <th>Tour Type</th>
              <th>Total Clients</th>
              <th>Checked In</th>
              <th>Not Arrived</th>
              <th>Guides</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, idx) => (
              <React.Fragment key={idx}>
                <tr onClick={() => toggleRow(idx)} style={{ cursor: 'pointer', borderBottom: '1px solid #ddd' }}>
                  <td>{new Date(s.tourDate).toLocaleDateString()}</td>
                  <td>{s.tourType}</td>
                  <td>{s.totalClients}</td>
                  <td>{s.checkedInCount}</td>
                  <td>{s.notArrivedCount}</td>
                  <td>
                    {s.Guides && s.Guides.length > 0 
                      ? s.Guides.map(g => g.GuideName).join(', ')
                      : 'None'}
                  </td>
                </tr>
                {expandedRows[idx] && s.Guides && s.Guides.length > 0 && (
                  <tr>
                    <td colSpan="6">
                      <table className="inner-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                        <thead>
                          <tr>
                            <th>Guide Name</th>
                            <th>Clients</th>
                            <th>Checked In</th>
                            <th>Not Arrived</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.Guides.map((g, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                              <td>{g.GuideName}</td>
                              <td>{g.Clients}</td>
                              <td>{g.CheckedInCount}</td>
                              <td>{g.NotArrivedCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StatsPage;
