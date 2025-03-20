import React, { useState } from 'react';

function ImportPage({ token }) {
  const [excelFile, setExcelFile] = useState(null);
  const [message, setMessage] = useState('');
  const baseUrl = 'https://localhost:7246/api/records';

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setExcelFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!excelFile) {
      alert('Please select an Excel file first.');
      return;
    }
    const formData = new FormData();
    formData.append('file', excelFile);

    fetch(`${baseUrl}/import-excel`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: formData,
    })
      .then((res) => res.text())
      .then((responseMsg) => {
        setMessage(responseMsg);
      })
      .catch((err) => {
        setMessage('Import failed: ' + err);
      });
  };

  return (
    <div className="container">
      <h1>Import Excel</h1>
      <input
        type="file"
        accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFileChange}
      />
      <button className="btn btn-primary" onClick={handleImport}>
        Import Excel
      </button>
      {message && <div className="mt-3">{message}</div>}
    </div>
  );
}

export default ImportPage;
