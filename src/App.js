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

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/Auth/Me`, {
      method: 'GET',
      credentials: 'include', 
    })
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);  // 200 OK → user authorized
        } else {
          setIsAuthenticated(false); // 401/403 → unauthorize
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  return (
    <Router>
      <Navbar
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
      />

      <div className="app-content">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/tour/:tourType" element={<TourDetails />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/qrscan" element={<QRScanPage />} />
          <Route path="/stats" element={<StatsPage />} />

          <Route
            path="/login"
            element={<LoginPage onLogin={() => setIsAuthenticated(true)} />}
          />

          <Route path="/changepassword" element={<ChangePasswordPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
