import React, { useState, useEffect } from 'react';

function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiBase = process.env.REACT_APP_CODESPACE_NAME
    ? `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev`
    : 'http://localhost:8000';
  const apiUrl = `${apiBase}/api/workouts/`;

  useEffect(() => {
    console.log('Workouts: fetching from', apiUrl);
    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log('Workouts: fetched data', data);
        const items = Array.isArray(data) ? data : data.results || [];
        setWorkouts(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Workouts: fetch error', err);
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
        <p>Loading workouts...</p>
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
        <h2 className="mb-0">💪 Workouts</h2>
        <span className="badge bg-light text-dark">{workouts.length} workouts</span>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover table-striped table-bordered octofit-table mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Duration (min)</th>
                <th>Intensity</th>
              </tr>
            </thead>
            <tbody>
              {workouts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No workouts found.
                  </td>
                </tr>
              ) : (
                workouts.map((workout, idx) => (
                  <tr key={workout._id || workout.id || idx}>
                    <td className="text-muted">{idx + 1}</td>
                    <td className="fw-semibold">{workout.name}</td>
                    <td>{workout.description}</td>
                    <td>
                      <span className="fw-semibold">{workout.duration}</span>
                      <small className="text-muted ms-1">min</small>
                    </td>
                    <td>
                      <span className={`badge ${
                        workout.intensity === 'High'   ? 'bg-danger'  :
                        workout.intensity === 'Medium' ? 'bg-warning text-dark' :
                        'bg-success'
                      }`}>{workout.intensity}</span>
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

export default Workouts;
