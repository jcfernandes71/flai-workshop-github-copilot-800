import React, { useState, useEffect } from 'react';

// members may arrive as a JSON array or as a Python-list string e.g. "['a', 'b']"
const parseMembers = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const json = raw.trim().replace(/'/g, '"');
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
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

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiBase = process.env.REACT_APP_CODESPACE_NAME
    ? `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev`
    : 'http://localhost:8000';
  const apiUrl = `${apiBase}/api/teams/`;

  useEffect(() => {
    console.log('Teams: fetching from', apiUrl);
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('Teams: fetched data', data);
        const items = Array.isArray(data) ? data : data.results || [];
        setTeams(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Teams: fetch error', err);
        setError(err.message);
        setLoading(false);
      });
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="octofit-loading">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading teams...</p>
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
        <h2 className="mb-0">🏆 Teams</h2>
        <span className="badge bg-light text-dark">{teams.length} teams</span>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped table-bordered octofit-table mb-0">
            <thead>
              <tr>
                <th>Team Name</th>
                <th>Members</th>
                <th>Member Count</th>
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center text-muted py-4">
                    No teams found.
                  </td>
                </tr>
              ) : (
                teams.map((team, idx) => {
                  const members = parseMembers(team.members);
                  return (
                    <tr key={team._id || team.id || idx}>
                      <td className="fw-semibold">{team.name}</td>
                      <td>
                        {members.length > 0 ? (
                          members.map((m, i) => (
                            <span key={i} className="badge bg-secondary me-1">{m}</span>
                          ))
                        ) : (
                          <span className="text-muted">No members</span>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-info text-dark">{members.length}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Teams;
