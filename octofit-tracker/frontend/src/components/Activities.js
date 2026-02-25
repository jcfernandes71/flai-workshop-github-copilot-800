import React, { useState, useEffect } from 'react';

const formatDate = (dateStr) => dateStr || 'N/A';

function Activities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.REACT_APP_CODESPACE_NAME
    ? `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev/api/activities/`
    : 'http://localhost:8000/api/activities/';

  useEffect(() => {
    console.log('Activities: fetching from', apiUrl);
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('Activities: fetched data', data);
        const items = Array.isArray(data) ? data : data.results || [];
        setActivities(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Activities: fetch error', err);
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
        <p>Loading activities...</p>
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
        <h2 className="mb-0">🏃 Activities</h2>
        <span className="badge bg-light text-dark">{activities.length} records</span>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped table-bordered octofit-table mb-0">
            <thead>
              <tr>
                <th>User</th>
                <th>Activity Type</th>
                <th>Duration (min)</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-4">
                    No activities found.
                  </td>
                </tr>
              ) : (
                activities.map((activity, idx) => (
                  <tr key={activity._id || activity.id || idx}>
                    <td>
                      <span className="badge bg-secondary">
                        {activity.user || activity.user_id || 'N/A'}
                      </span>
                    </td>
                    <td>{activity.activity_type}</td>
                    <td>
                      <span className="fw-semibold">{activity.duration}</span>
                      <small className="text-muted ms-1">min</small>
                    </td>
                    <td>{formatDate(activity.date)}</td>
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

export default Activities;
