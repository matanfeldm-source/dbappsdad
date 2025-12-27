import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useParams } from 'react-router-dom';
import Overview from './pages/Overview';
import CustomerJourney from './pages/CustomerJourney';
import Dashboard from './pages/Dashboard';
import TechnicianMap from './pages/TechnicianMap';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-title">אפליקציית מסע הלקוח</h1>
            <div className="nav-links">
              <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                סקירה
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                לוח בקרה
              </NavLink>
              <NavLink to="/technicians" className={({ isActive }) => isActive ? 'active' : ''}>
                מפת טכנאים
              </NavLink>
            </div>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/customer/:id" element={<CustomerJourney />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/technicians" element={<TechnicianMap />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

