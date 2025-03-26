import React, { useEffect, useState } from 'react'

function StatsPage({ token }) {
	const [stats, setStats] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const apiUrl = `${process.env.REACT_APP_API_URL}/api/records/stats`
	useEffect(() => {
		if (!token) {
			setError('Please log in to view stats.')
			setLoading(false)
			return
		}
		fetch(apiUrl, {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(res => {
				if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
				return res.json()
			})
			.then(data => {
				setStats(data)
				setLoading(false)
			})
			.catch(err => {
				setError(err.message)
				setLoading(false)
			})
	}, [apiUrl, token])

	if (loading) return <div>Loading...</div>
	if (error) return <div>Error: {error}</div>

	return (
		<div className='container'>
			<h1>Completed Trips Statistics</h1>
			{stats.length === 0 ? (
				<p>No completed trips found.</p>
			) : (
				<table className='records-table'>
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
	)
}

export default StatsPage
