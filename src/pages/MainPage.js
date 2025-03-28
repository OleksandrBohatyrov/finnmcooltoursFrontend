import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/MainPage.css'

function MainPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const apiUrl = `${process.env.REACT_APP_API_URL}/api/records`

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
          throw new Error(`HTTP error: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        setRecords(data)
        setLoading(false)
      })
      .catch((err) => {
        if (err.message.includes('401')) {
          setError('Please log in to view records.')
        } else {
          setError(err.message)
        }
        setLoading(false)
      })
  }, [apiUrl])

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">Error: {error}</div>

  const grouped = records.reduce((acc, record) => {
    const key = record.tourType || 'Unknown'
    if (!acc[key]) {
      acc[key] = 0
    }
    acc[key] += record.pax
    return acc
  }, {})

  return (
    <div className="main-page">
      <h1>All Tours</h1>
      {Object.keys(grouped).length === 0 ? (
        <p>No tours found.</p>
      ) : (
        <ul className="tour-list">
          {Object.keys(grouped).map((tourType) => (
            <li key={tourType}>
              <Link to={`/tour/${encodeURIComponent(tourType)}`}>
                {tourType} ({grouped[tourType]} passengers)
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MainPage
