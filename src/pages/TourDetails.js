import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AlertDialog from '../components/AlertDialog'
import DeleteAlertDialog from '../components/DeleteAlertDialog'
import NotesDialog from '../components/NotesDialog'
import '../styles/TourDetails.css'

function TourDetails() {
  const { tourType } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const highlightedId = params.get('highlighted')

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPassenger, setSelectedPassenger] = useState(null)

  const [editPaxId, setEditPaxId] = useState(null)
  const [editPaxValue, setEditPaxValue] = useState('')

  // Id of current user
  const [currentUserId, setCurrentUserId] = useState('')

  const [originalPaxMap, setOriginalPaxMap] = useState({})

  const [showAddForm, setShowAddForm] = useState(false)
  const [newSurname, setNewSurname] = useState('')
  const [newFirstName, setNewFirstName] = useState('')
  const [newPax, setNewPax] = useState(1)

  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [notesDialogText, setNotesDialogText] = useState('')

  const rowRefs = useRef({})
  const [searchTerm, setSearchTerm] = useState('')
  const scrolledRef = useRef(false)

  const recordsApiUrl = `${process.env.REACT_APP_API_URL}/api/records?tourType=${encodeURIComponent(tourType)}`
  const createPassengerUrl = `${process.env.REACT_APP_API_URL}/api/records/create`

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/Auth/Me`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        return res.json()
      })
      .then(data => {
        setCurrentUserId(data.name || '')
      })
      .catch(err => {
        console.error('Error fetching current user:', err)
        setCurrentUserId('Unknown')
      })
  }, [])

  useEffect(() => {
    const loadRecords = () => {
      fetch(recordsApiUrl, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => {
          if (!res.ok) {
            if (res.status === 401) throw new Error('Please log in to view details.')
            throw new Error(`HTTP error: ${res.status}`)
          }
          return res.json()
        })
        .then(data => {
          const updatedMap = { ...originalPaxMap }
          data.forEach(record => {
            const key = `originalPax_${record.id}`
            if (updatedMap[record.id] === undefined) {
              const stored = localStorage.getItem(key)
              if (stored !== null) {
                updatedMap[record.id] = parseInt(stored, 10)
              } else {
                updatedMap[record.id] = record.pax
                localStorage.setItem(key, record.pax)
              }
            }
          })
          setOriginalPaxMap(updatedMap)
          setRecords(data)
          setLoading(false)
        })
        .catch(err => {
          console.warn('Fetch error:', err)
          setLoading(false)
        })
    }

    loadRecords()
    const intervalId = setInterval(loadRecords, 5000)
    return () => clearInterval(intervalId)
  }, [tourType, recordsApiUrl, originalPaxMap])

  useEffect(() => {
    if (highlightedId && records.length > 0 && !scrolledRef.current) {
      const highlightedRow = rowRefs.current[highlightedId]
      if (highlightedRow) {
        highlightedRow.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      scrolledRef.current = true
    }
  }, [highlightedId, records])

  //  Check-in
  const markCheckedIn = async id => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/records/${id}/checkin`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
      setRecords(prev => prev.map(r => (r.id === id ? { ...r, checkedIn: true, checkedInBy: currentUserId } : r)))
    } catch (err) {
      console.error(err)
    }
  }

  // Check in delete
  const handleRemoveCheckIn = passenger => {
    setSelectedPassenger(passenger)
    setDialogOpen(true)
  }
  const confirmRemoveCheckedIn = async () => {
    if (!selectedPassenger) return
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/records/${selectedPassenger.id}/remove-checkin`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
      setRecords(prev => prev.map(r => (r.id === selectedPassenger.id ? { ...r, checkedIn: false, checkedInBy: null } : r)))
    } catch (err) {
      console.error('Error removing check-in:', err)
    } finally {
      setDialogOpen(false)
      setSelectedPassenger(null)
    }
  }

  // Delete passenger
  const handleRemovePassenger = passenger => {
    setSelectedPassenger(passenger)
    setDeleteDialogOpen(true)
  }
  const confirmRemovePassenger = async () => {
    if (!selectedPassenger) return
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/records/remove?id=${selectedPassenger.id}`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
      const updatedList = await fetch(recordsApiUrl, { credentials: 'include' }).then(r => r.json())
      setRecords(updatedList)
    } catch (err) {
      console.error('Error removing passenger:', err)
      alert('Error: ' + err.message)
    } finally {
      setDeleteDialogOpen(false)
      setSelectedPassenger(null)
    }
  }

  // Pax update
  const handlePaxClick = (id, currentPax) => {
    setEditPaxId(id)
    setEditPaxValue(String(currentPax))
  }
  const handlePaxSave = async () => {
    const newPaxNumber = parseInt(editPaxValue, 10)
    if (isNaN(newPaxNumber) || newPaxNumber < 0) {
      alert('Invalid Pax value')
      return
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/records/${editPaxId}/pax`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pax: newPaxNumber }),
      })
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
      setRecords(prev => prev.map(r => (r.id === editPaxId ? { ...r, pax: newPaxNumber } : r)))
    } catch (err) {
      console.error('Error updating pax:', err)
    } finally {
      setEditPaxId(null)
      setEditPaxValue('')
    }
  }
  const handlePaxKeyDown = e => {
    if (e.key === 'Enter') {
      handlePaxSave()
    } else if (e.key === 'Escape') {
      setEditPaxId(null)
      setEditPaxValue('')
    }
  }

  //  Filter
  const filteredRecords = records.filter(r => {
    if (!searchTerm.trim()) return true
    const lowerSearch = searchTerm.toLowerCase()
    const fullName = (r.surname + ' ' + r.firstName).toLowerCase()
    return fullName.includes(lowerSearch)
  })

  // Front rows sort
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (a.seats === 'Front' && b.seats !== 'Front') return -1
    if (b.seats === 'Front' && a.seats !== 'Front') return 1
    return (a.surname || '').localeCompare(b.surname || '')
  })

  const totalPassengers = sortedRecords.reduce((acc, r) => acc + r.pax, 0)
  const checkedInPassengers = sortedRecords.reduce((acc, r) => acc + (r.checkedIn ? r.pax : 0), 0)
  const myCheckedIn = sortedRecords
    .filter(r => r.checkedIn && r.checkedInBy && currentUserId && r.checkedInBy.toLowerCase() === currentUserId.toLowerCase())
    .reduce((acc, r) => acc + r.pax, 0)

  // Add new passenger
  const handleAddPassenger = async () => {
    if (!newSurname.trim() || !newFirstName.trim()) {
      alert('Please fill in the mandatory fields: Surname and First Name.')
      return
    }
    if (newPax < 1) {
      alert('The number of passengers must be at least 1.')
      return
    }

    const selectedTourDate = new Date().toISOString()
    const dto = {
      TourDate: selectedTourDate,
      TourType: tourType,
      Surname: newSurname,
      FirstName: newFirstName,
      Pax: newPax,
    }

    try {
      const res = await fetch(createPassengerUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      })
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
      await res.json()

      const updatedList = await fetch(recordsApiUrl, { credentials: 'include' }).then(r => r.json())
      setRecords(updatedList)
      setShowAddForm(false)
      setNewSurname('')
      setNewFirstName('')
      setNewPax(1)
    } catch (err) {
      console.error('Error adding passenger:', err)
      alert('Error: ' + err.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>

  const handleShowNotes = notes => {
    setNotesDialogText(notes)
    setNotesDialogOpen(true)
  }

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
      </div>

      <div style={{ margin: '1rem 0' }}>
        <button style={styles.addPassengerBtn} onClick={() => setShowAddForm(prev => !prev)}>
          {showAddForm ? 'Cancel' : 'Add Passenger'}
        </button>
      </div>

      {showAddForm && (
        <div style={styles.addPassengerForm}>
          <h3>Add a New Passenger</h3>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Surname <span style={{ color: 'red' }}>*</span>:
            </label>
            <input
              type="text"
              value={newSurname}
              onChange={e => setNewSurname(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              First Name <span style={{ color: 'red' }}>*</span>:
            </label>
            <input
              type="text"
              value={newFirstName}
              onChange={e => setNewFirstName(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label>
              Pax <span style={{ color: 'red' }}>*</span>:
            </label>
            <input
              type="number"
              value={newPax}
              onChange={e => setNewPax(parseInt(e.target.value) || 1)}
            />
          </div>
          <button style={styles.addPassengerBtn} onClick={handleAddPassenger}>
            Save
          </button>
        </div>
      )}

      {/* Passenger Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Surname</th>
              <th style={styles.th}>First Name</th>
              <th style={{ ...styles.th, ...styles.narrowCol }}>Pax</th>
              <th style={{ ...styles.th, ...styles.narrowCol }}>Checked</th>
              <th style={{ ...styles.th, ...styles.narrowCol }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map(r => (
              <tr
                key={r.id}
                ref={el => (rowRefs.current[r.id] = el)}
                className={String(r.id) === highlightedId ? 'highlighted' : ''}
                style={{
                  backgroundColor: r.notes ? 'lightblue' : 'inherit',
                  cursor: r.notes ? 'pointer' : 'auto',
                }}
                onClick={() => {
                  if (r.notes) {
                    handleShowNotes(r.notes)
                  }
                }}
              >
                <td style={styles.td}>
                  {new Date(r.tourDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </td>
                <td
                  style={{
                    ...styles.td,
                    ...(r.seats === 'Front' ? { backgroundColor: 'yellow' } : {}),
                  }}
                >
                  {r.surname}
                </td>
                <td
                  style={{
                    ...styles.td,
                    ...(r.seats === 'Front' ? { backgroundColor: 'yellow' } : {}),
                  }}
                >
                  {r.firstName}
                </td>
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
                    <span
                      style={{
                        cursor: 'pointer',
                        backgroundColor:
                          r.pax !== r.originalPax ? '#FF474D' : 'inherit',
                        padding: '0.2rem',
                        borderRadius: '4px',
                      }}
                      onClick={e => {
                        e.stopPropagation()
                        handlePaxClick(r.id, r.pax)
                      }}
                    >
                      {r.pax}
                    </span>
                  )}
                </td>
                <td style={{ ...styles.td, ...styles.narrowCol }}>
                  {r.checkedIn ? 'Yes' : 'No'}
                </td>
                <td style={{ ...styles.td, ...styles.narrowCol }}>
                  {r.checkedIn ? (
                    <>
                      <button
                        style={styles.removeCheckInBtn}
                        onClick={e => {
                          e.stopPropagation()
                          handleRemoveCheckIn(r)
                        }}
                      >
                        ✕
                      </button>
                      {r.checkedInBy && (
                        <span style={{ marginLeft: '0.5rem' }}>{r.checkedInBy}</span>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        style={styles.checkInBtn}
                        onClick={e => {
                          e.stopPropagation()
                          markCheckedIn(r.id)
                        }}
                      >
                        ✓
                      </button>
                      <button
                        style={{ ...styles.removeCheckInBtn, marginLeft: '0.5rem' }}
                        onClick={e => {
                          e.stopPropagation()
                          handleRemovePassenger(r)
                        }}
                      >
                        Delete
                      </button>
                    </>
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

      <DeleteAlertDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmRemovePassenger}
        passengerName={selectedPassenger ? `${selectedPassenger.surname} ${selectedPassenger.firstName}` : ''}
      />

      <NotesDialog
        open={notesDialogOpen}
        onClose={() => setNotesDialogOpen(false)}
        notes={notesDialogText}
      />
    </div>
  )
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
    backgroundColor: '#007bff',
    borderRadius: '24px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    marginLeft: '1rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
  },
  addPassengerBtn: {
    backgroundColor: '#28a745',
    borderRadius: '24px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
  },

  addPassengerForm: {
    margin: '1rem 0',
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
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
    width: '40px',
    textAlign: 'center',
    padding: '0.2rem',
  },
  paxInput: {
    width: '30px',
    textAlign: 'center',
  },
  checkInBtn: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    fontSize: '1.8rem',
    padding: '0.2rem 0.4rem',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  removeCheckInBtn: {
    backgroundColor: '#ffc107',
    color: '#000',
    border: 'none',
    fontSize: '0.7rem',
    padding: '0.2rem 0.3rem',
    cursor: 'pointer',
    borderRadius: '4px',
  },
}

export default TourDetails
