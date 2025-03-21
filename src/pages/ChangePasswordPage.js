import React, { useState } from 'react';

function ChangePasswordPage({ token }) {
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePassword = async () => {
    setMessage('');
    try {
      const res = await fetch('http://62.60.157.133:5000/api/Auth/ChangePassword', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, currentPassword, newPassword })
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const responseText = await res.text();
      setMessage(responseText);
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="container">
      <h1>Change Password</h1>
      <div className="form-group">
        <label>Email:</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@gmail.com" />
      </div>
      <div className="form-group">
        <label>Current Password:</label>
        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current Password" />
      </div>
      <div className="form-group">
        <label>New Password:</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" />
      </div>
      <button className="btn btn-primary" onClick={handleChangePassword}>Change Password</button>
      {message && <div className="form-message">{message}</div>}
    </div>
  );
}

export default ChangePasswordPage;
