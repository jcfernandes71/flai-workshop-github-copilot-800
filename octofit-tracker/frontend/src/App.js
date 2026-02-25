import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import logo from './octofitapp-small.png';
import Activities from './components/Activities';
import Leaderboard from './components/Leaderboard';
import Teams from './components/Teams';
import Users from './components/Users';
import Workouts from './components/Workouts';

const NAV_ITEMS = [
  { path: '/users',       label: 'Users',       icon: '👤' },
  { path: '/teams',       label: 'Teams',       icon: '🏆' },
  { path: '/activities',  label: 'Activities',  icon: '🏃' },
  { path: '/workouts',    label: 'Workouts',    icon: '💪' },
  { path: '/leaderboard', label: 'Leaderboard', icon: '📊' },
];

function App() {
  return (
    <div>
      {/* ── Navbar ── */}
      <nav className="navbar navbar-expand-lg navbar-dark octofit-navbar">
        <div className="container-fluid px-4">
          <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img
              src={logo}
              alt="OctoFit logo"
              className="octofit-navbar-logo"
            />
            OctoFit Tracker
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto gap-1">
              {NAV_ITEMS.map(({ path, label, icon }) => (
                <li className="nav-item" key={path}>
                  <NavLink
                    className={({ isActive }) =>
                      'nav-link' + (isActive ? ' active' : '')
                    }
                    to={path}
                  >
                    <span className="me-1">{icon}</span>{label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* ── Page content ── */}
      <div className="container-fluid octofit-page">
        <Routes>
          <Route
            path="/"
            element={
              <div className="octofit-hero">
                <h1>🐙 Welcome to OctoFit Tracker</h1>
                <p>Track your fitness activities, workouts, teams, and compete on the leaderboard.</p>
                <ul className="nav nav-pills justify-content-center mt-3">
                  {NAV_ITEMS.map(({ path, label, icon }) => (
                    <li className="nav-item" key={path}>
                      <NavLink className="nav-link" to={path}>
                        {icon} {label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            }
          />
          <Route path="/users"       element={<Users />} />
          <Route path="/teams"       element={<Teams />} />
          <Route path="/activities"  element={<Activities />} />
          <Route path="/workouts"    element={<Workouts />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
