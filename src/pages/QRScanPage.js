import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import QrReader from 'react-web-qr-reader'

function QRScanPage() {
	const [message, setMessage] = useState('')
	const [scannedPassenger, setScannedPassenger] = useState(null)
	const [uniqueRef, setUniqueRef] = useState('')
	const navigate = useNavigate()
	const location = useLocation()

	const { tourType } = location.state || {}

	const delay = 500

	const previewStyle = {
		width: '100%',
		maxWidth: '400px',
		margin: '0 auto',
		display: 'block',
	}

	const handleResult = async (data, error) => {
		if (error) {
			console.error('QR scan error:', error)
			setMessage('Error scanning QR code: ' + error.message)
			return
		}
		if (data) {
			let ref = typeof data === 'object' && data.data ? data.data : String(data)
			console.log('Scanned QR code:', ref)

			setUniqueRef(ref)
			setMessage('Scanning...')

			try {
				const res = await fetch(`${process.env.REACT_APP_API_URL}/api/records/checkin-unique`, {
					method: 'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						UniqueRef: ref,
						TourType: tourType,
					}),
				})

				if (res.status === 404) {
					setMessage('Passenger not found.')
					return
				}
				if (res.status === 400) {
					const errText = await res.text()
					setMessage(errText || 'This passenger belongs to a different tour.')
					return
				}
				if (!res.ok) {
					throw new Error(`HTTP error: ${res.status}`)
				}

				const responseData = await res.json()
				console.log('API response:', responseData)
				setScannedPassenger(responseData.Passenger || responseData.passenger)
				setMessage(`Success: ${responseData.Message || responseData.message}`)
			} catch (err) {
				console.error('Fetch error:', err)
				setMessage('Error: ' + err.message)
			}
		}
	}

	const handleBack = () => {
		if (scannedPassenger && tourType) {
			const url = `/tour/${encodeURIComponent(tourType)}?highlighted=${scannedPassenger.id}`
			navigate(url)
		} else {
			navigate(-1)
		}
	}

	return (
		<div style={styles.container}>
			<h2 style={styles.title}>QR Scanner</h2>
			<div style={styles.scannerWrapper}>
				<QrReader delay={delay} style={previewStyle} onScan={handleResult} constraints={{ facingMode: 'environment' }} />
			</div>

			{uniqueRef && <p style={styles.refText}>QR Data: {uniqueRef}</p>}
			{scannedPassenger && (
				<div style={styles.passengerInfo}>
					<p>
						Passenger: {scannedPassenger.surname} {scannedPassenger.firstName}
					</p>
				</div>
			)}
			{message && <p style={message.startsWith('Success') ? styles.success : styles.error}>{message}</p>}
			<button style={styles.backButton} onClick={handleBack}>
				Go Back
			</button>
		</div>
	)
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
}

export default QRScanPage
