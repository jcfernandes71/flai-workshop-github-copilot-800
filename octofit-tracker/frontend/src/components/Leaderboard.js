import React, { useState, useEffect } from 'react';

// Parse Python-style list string or real array to JS array
const parseMembers = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      return JSON.parse(raw.trim().replace(/'/g, '"'));
    } catch {
      return raw
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    }
  }
  return [];
};

function Leaderboard() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const leaderboardUrl = process.env.REACT_APP_CODESPACE_NAME
      ? `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/leaderboard/`
      : 'http://localhost:8000/api/leaderboard/';
    const teamsUrl = process.env.REACT_APP_CODESPACE_NAME
      ? `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/teams/`
      : 'http://localhost:8000/api/teams/';
    const activitiesUrl = process.env.REACT_APP_CODESPACE_NAME
      ? `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/activities/`
      : 'http://localhost:8000/api/activities/';

    console.log('Leaderboard: fetching from', leaderboardUrl);
    console.log('Teams: fetching from', teamsUrl);
    console.log('Activities: fetching from', activitiesUrl);

    Promise.all([
      fetch(leaderboardUrl).then((r) => { if (!r.ok) throw new Error(`Leaderboard HTTP ${r.status}`); return r.json(); }),
      fetch(teamsUrl).then((r)       => { if (!r.ok) throw new Error(`Teams HTTP ${r.status}`);       return r.json(); }),
      fetch(activitiesUrl).then((r)  => { if (!r.ok) throw new Error(`Activities HTTP ${r.status}`);  return r.json(); }),
    ])
      .then(([lbData, teamsData, activitiesData]) => {
        console.log('Leaderboard: fetched leaderboard', lbData);
        console.log('Leaderboard: fetched teams', teamsData);
        console.log('Leaderboard: fetched activities', activitiesData);

        const leaderboard  = Array.isArray(lbData)         ? lbData         : lbData.results         || [];
        const teams        = Array.isArray(teamsData)       ? teamsData       : teamsData.results       || [];
        const activities   = Array.isArray(activitiesData)  ? activitiesData  : activitiesData.results  || [];

        // Build username -> team name lookup
        const teamLookup = {};
        teams.forEach((team) => {
          parseMembers(team.members).forEach((member) => {
            teamLookup[member] = team.name;
          });
        });

        // Build username -> total calories (10 cal/min)
        const calorieLookup = {};
        activities.forEach((activity) => {
          const cal = Math.round((parseFloat(activity.duration) || 0) * 10);
          calorieLookup[activity.user] = (calorieLookup[activity.user] || 0) + cal;
        });

        // Enrich leaderboard entries
        const enriched = leaderboard.map((entry) => ({
          ...entry,
          team:     teamLookup[entry.user]     || 'N/A',
          calories: calorieLookup[entry.user]  || 0,
        }));

        setEntries(enriched);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Leaderboard: fetch error', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const rankClass = (idx) => {
    if (idx === 0) return 'gold';
    if (idx === 1) return 'silver';
    if (idx === 2) return 'bronze';
    return '';
  };

  if (loading) {
    return (
      <div className="octofit-loading">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2 mt-3" role="alert">
        <span>⚠️</span>
        <span><strong>Error:</strong> {error}</span>
      </div>
    );
  }

  return (
    <div className="card octofit-card">
      <div className="card-header d-flex align-items-center justify-content-between">
        <h2 className="mb-0">📊 Leaderboard</h2>
        <span className="badge bg-light text-dark">{entries.length} entries</span>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped table-bordered octofit-table mb-0">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Rank</th>
                <th>User</th>
                <th>Team</th>
                <th>Total Calories</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No leaderboard entries found.
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => (
                  <tr key={entry._id || entry.id || idx}>
                    <td className="text-center">
                      <span className={`rank-badge ${rankClass(idx)}`}>{idx + 1}</span>
                    </td>
                    <td className="fw-semibold">{entry.user}</td>
                    <td>
                      <span className="badge bg-secondary">{entry.team}</span>
                    </td>
                    <td>
                      <span className="fw-semibold">{entry.calories.toLocaleString()}</span>
                      <small className="text-muted ms-1">cal</small>
                    </td>
                    <td>
                      <span className="badge bg-primary fs-6">{entry.score}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;

