import React, { useState } from 'react'

function ImportPage() {
	const [excelFile, setExcelFile] = useState(null)
	const [message, setMessage] = useState('')
	const baseUrl = `${process.env.REACT_APP_API_URL}/api/records`

	const handleFileChange = e => {
		if (e.target.files && e.target.files.length > 0) {
			setExcelFile(e.target.files[0])
		}
	}

	const handleImport = () => {
		if (!excelFile) {
			alert('Please select an Excel file first.')
			return
		}
		const formData = new FormData()
		formData.append('file', excelFile)

		fetch(`${baseUrl}/import-excel`, {
			method: 'POST',
			credentials: 'include', // JWT cookies
			body: formData,
		})
			.then(res => {
				if (res.status === 401) {
					throw new Error('Please log in before importing.')
				}
				if (!res.ok) {
					throw new Error(`HTTP error: ${res.status}`)
				}
				return res.text()
			})
			.then(responseMsg => {
				setMessage(responseMsg)
			})
			.catch(err => {
				setMessage('Import failed: ' + err.message)
			})
	}

	return (
		<div className='container'>
			<h1>Import Excel</h1>
			<input type='file' accept='.xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' onChange={handleFileChange} />
			<button className='btn btn-primary' onClick={handleImport}>
				Import Excel
			</button>
			{message && <div className='mt-3'>{message}</div>}
		</div>
	)
}

export default ImportPage
