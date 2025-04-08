import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MainPage from './pages/MainPage';
import TourDetails from './pages/TourDetails';
import ImportPage from './pages/ImportPage';
import StatsPage from './pages/StatsPage';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import QRScanPage from './pages/QRScanPage';
import GuidePage from './pages/GuideManagementPage';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Функция для обновления текущего пользователя:
  const updateUser = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/Auth/Me`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        return;
      }
      const data = await res.json();
      setIsAuthenticated(true);
      setIsAdmin(data.isAdmin);
    } catch (err) {
      console.error('Error fetching current user:', err);
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    updateUser();
  }, []);

  return (
    <Router>
      <Navbar
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        setIsAuthenticated={setIsAuthenticated}
        refreshUser={updateUser}
      />

      <div className="app-content">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/tour/:tourType" element={<TourDetails />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/qrscan" element={<QRScanPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/login" element={<LoginPage onLogin={updateUser} />} />
          <Route path="/changepassword" element={<ChangePasswordPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
