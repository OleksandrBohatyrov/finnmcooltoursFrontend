import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MainPage from './pages/MainPage';
import TourDetails from './pages/TourDetails';
import ImportPage from './pages/ImportPage';
import StatsPage from './pages/StatsPage';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import QRScanPage from './pages/QRScanPage';

function App() {
  const [token, setToken] = useState(null);

  return (
    <Router>
      <Navbar token={token} setToken={setToken} />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<MainPage token={token} />} />
          <Route path="/tour/:tourType" element={<TourDetails token={token} />} />
          <Route path="/import" element={<ImportPage token={token} />} />
          <Route path="/qrscan" element={<QRScanPage token={token} />} />
          <Route path="/stats" element={<StatsPage token={token} />} />
          <Route path="/login" element={<LoginPage onLogin={setToken} />} />
          <Route path="/changepassword" element={<ChangePasswordPage token={token} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
