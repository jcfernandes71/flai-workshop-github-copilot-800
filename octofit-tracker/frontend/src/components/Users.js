import React, { useState, useEffect, useCallback } from 'react';

const formatName = (username) =>
  username
    ? username.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'N/A';

// Parse Python-style list string or real array into a JS array
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

function Users() {
  const [users, setUsers]     = useState([]);
  const [teams, setTeams]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Edit modal state
  const [editingUser, setEditingUser]   = useState(null);
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail]       = useState('');
  const [formTeamId, setFormTeamId]     = useState('');
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState(null);

  const apiBase = process.env.REACT_APP_CODESPACE_NAME
    ? `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev`
    : 'http://localhost:8000';

  const usersUrl = `${apiBase}/api/users/`;
  const teamsUrl = `${apiBase}/api/teams/`;

  const loadData = useCallback(() => {
    setLoading(true);
    console.log('Users: fetching from', usersUrl, teamsUrl);
    Promise.all([
      fetch(usersUrl).then((r) => { if (!r.ok) throw new Error(`Users HTTP ${r.status}`);  return r.json(); }),
      fetch(teamsUrl).then((r) => { if (!r.ok) throw new Error(`Teams HTTP ${r.status}`);  return r.json(); }),
    ])
      .then(([userData, teamsData]) => {
        console.log('Users: fetched users', userData);
        console.log('Users: fetched teams', teamsData);
        setUsers(Array.isArray(userData)  ? userData  : userData.results  || []);
        setTeams(Array.isArray(teamsData) ? teamsData : teamsData.results || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Users: fetch error', err);
        setError(err.message);
        setLoading(false);
      });
  }, [usersUrl, teamsUrl]);

  useEffect(() => { loadData(); }, [loadData]);

  // Build username -> team lookup
  const teamByUsername = {};
  teams.forEach((team) => {
    parseMembers(team.members).forEach((m) => { teamByUsername[m] = team; });
  });

  const openEdit = (user) => {
    const currentTeam = teamByUsername[user.username];
    setEditingUser(user);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormTeamId(currentTeam ? currentTeam.id : '');
    setSaveError(null);
  };

  const closeEdit = () => {
    setEditingUser(null);
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      // 1. PATCH user record (username + email)
      const userRes = await fetch(`${apiBase}/api/users/${editingUser.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formUsername, email: formEmail }),
      });
      if (!userRes.ok) throw new Error(`Failed to update user (HTTP ${userRes.status})`);

      // 2. Update team membership if changed
      const prevTeam   = teamByUsername[editingUser.username];
      const prevTeamId = prevTeam ? prevTeam.id : '';

      if (String(formTeamId) !== String(prevTeamId)) {
        // Remove from old team
        if (prevTeam) {
          const oldMembers = parseMembers(prevTeam.members).filter((m) => m !== editingUser.username);
          const r = await fetch(`${apiBase}/api/teams/${prevTeam.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ members: oldMembers }),
          });
          if (!r.ok) throw new Error(`Failed to update old team (HTTP ${r.status})`);
        }
        // Add to new team
        if (formTeamId) {
          const newTeam    = teams.find((t) => String(t.id) === String(formTeamId));
          const newMembers = [
            ...parseMembers(newTeam.members).filter((m) => m !== editingUser.username),
            formUsername,
          ];
          const r = await fetch(`${apiBase}/api/teams/${formTeamId}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ members: newMembers }),
          });
          if (!r.ok) throw new Error(`Failed to update new team (HTTP ${r.status})`);
        }
      } else if (prevTeam && formUsername !== editingUser.username) {
        // Same team but username changed — keep username in sync
        const updatedMembers = parseMembers(prevTeam.members).map(
          (m) => (m === editingUser.username ? formUsername : m)
        );
        const r = await fetch(`${apiBase}/api/teams/${prevTeam.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ members: updatedMembers }),
        });
        if (!r.ok) throw new Error(`Failed to update team members (HTTP ${r.status})`);
      }

      closeEdit();
      loadData();
    } catch (err) {
      console.error('Users: save error', err);
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="octofit-loading">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading users...</p>
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
    <>
      <div className="card octofit-card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h2 className="mb-0">👤 Users</h2>
          <span className="badge bg-light text-dark">{users.length} users</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped table-bordered octofit-table mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Team</th>
                  <th style={{ width: '90px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => {
                    const team = teamByUsername[user.username];
                    return (
                      <tr key={user._id || user.id || idx}>
                        <td className="text-muted">{idx + 1}</td>
                        <td className="fw-semibold">{formatName(user.username)}</td>
                        <td>
                          <span className="badge bg-secondary font-monospace">{user.username}</span>
                        </td>
                        <td>
                          <a href={`mailto:${user.email}`} className="text-decoration-none">
                            {user.email}
                          </a>
                        </td>
                        <td>
                          {team
                            ? <span className="badge bg-info text-dark">{team.name}</span>
                            : <span className="text-muted fst-italic">No team</span>}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-octofit"
                            onClick={() => openEdit(user)}
                          >
                            ✏️ Edit
                          </button>
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

      {/* ── Edit Modal ── */}
      {editingUser && (
        <>
          <div
            className="modal fade show"
            style={{ display: 'block' }}
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content octofit-modal">
                <div className="modal-header">
                  <h5 className="modal-title">✏️ Edit — {formatName(editingUser.username)}</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeEdit}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  {saveError && (
                    <div className="alert alert-danger py-2 mb-3">{saveError}</div>
                  )}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Team</label>
                    <select
                      className="form-select"
                      value={formTeamId}
                      onChange={(e) => setFormTeamId(e.target.value)}
                    >
                      <option value="">— No team —</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={closeEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-octofit"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving
                      ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Saving…</>
                      : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={closeEdit} />
        </>
      )}
    </>
  );
}

export default Users;
