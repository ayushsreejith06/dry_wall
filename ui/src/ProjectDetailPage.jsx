import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_URL } from './config';
import AnimatedText from './components/AnimatedText';
import AnimatedButton from './components/AnimatedButton';
import SpotlightCard from './components/react-bits/SpotlightCard';
import LoadingSpinner from './components/LoadingSpinner';
import './ProjectDetailPage.css';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/projects/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch project');
      }
      const data = await res.json();
      setProject(data);
      setNotesValue(data.notes || '');
    } catch (err) {
      console.error(err);
      setError('Could not load project.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(
      (file) => file.name.toLowerCase().endsWith('.dwg') || file.name.toLowerCase().endsWith('.pdf')
    );

    if (validFiles.length === 0) {
      setError('Please select DWG or PDF files only.');
      return;
    }

    setUploadingFiles(true);
    setError('');

    try {
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(`${API_URL}/projects/${id}/upload-floor-plan`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      fetchProject();
    } catch (err) {
      console.error(err);
      setError(`Could not upload files: ${err.message}`);
    } finally {
      setUploadingFiles(false);
      e.target.value = '';
    }
  };

  const handleSaveNotes = async () => {
    try {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesValue }),
      });

      if (!res.ok) {
        throw new Error('Failed to save notes');
      }

      const updated = await res.json();
      setProject(updated);
      setEditingNotes(false);
    } catch (err) {
      console.error(err);
      setError('Could not save notes.');
    }
  };

  const handleToggleCompleted = async () => {
    try {
      const res = await fetch(`${API_URL}/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !project.completed }),
      });

      if (!res.ok) {
        throw new Error('Failed to update project');
      }

      const updated = await res.json();
      setProject(updated);
    } catch (err) {
      console.error(err);
      setError('Could not update project status.');
    }
  };

  const getMapUrl = () => {
    if (project?.location_data?.latitude && project?.location_data?.longitude) {
      const { latitude, longitude } = project.location_data;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="project-detail-loading">
          <LoadingSpinner size="large" />
          <p style={{ marginTop: '16px' }}>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="project-detail-page">
        <div className="project-detail-error">{error}</div>
        <Link to="/projects" className="ghost-link">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="project-detail-page">
      <header className="project-detail-header">
        <div>
          <AnimatedText variant="fade-up" delay={0.1}>
            <Link to="/projects" className="back-link">
              ← Back to Projects
            </Link>
          </AnimatedText>
          <AnimatedText variant="fade-up" delay={0.2} as="h1">
            {project.title}
          </AnimatedText>
          <AnimatedText variant="fade-up" delay={0.3} as="p" className="project-detail-location">
            {project.location}
          </AnimatedText>
        </div>
        <div className="project-detail-actions">
          <label className="checkbox">
            <input
              type="checkbox"
              checked={project.completed}
              onChange={handleToggleCompleted}
            />
            <span />
            <span style={{ marginLeft: '8px', color: '#eef2f7' }}>
              {project.completed ? 'Completed' : 'Mark as Completed'}
            </span>
          </label>
        </div>
      </header>

      {error && <div className="banner error">{error}</div>}

      <div className="project-detail-content">
        {/* Map Section */}
        {project.location_data && (
          <SpotlightCard className="project-detail-section-wrapper">
            <section className="project-detail-section">
              <h2>Location Map</h2>
            <div className="map-container">
              {getMapUrl() ? (
                <iframe
                  title="Location Map"
                  width="100%"
                  height="400"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={getMapUrl()}
                  style={{ border: '1px solid #1f2a3a', borderRadius: '12px' }}
                />
              ) : (
                <div className="map-placeholder">Map unavailable</div>
              )}
              <div className="map-address">
                <strong>Address:</strong> {project.location_data.address}
                {project.location_data.latitude && (
                  <span className="map-coords">
                    {' '}
                    ({project.location_data.latitude.toFixed(6)},{' '}
                    {project.location_data.longitude.toFixed(6)})
                  </span>
                )}
              </div>
            </div>
            </section>
          </SpotlightCard>
        )}

        {/* Floor Plans Section */}
        <SpotlightCard className="project-detail-section-wrapper">
          <section className="project-detail-section">
          <div className="section-header">
            <div>
              <h2>Floor Plans</h2>
              <p className="section-subtitle">
                Each file represents a floor plan for this house
              </p>
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="file"
              accept=".dwg,.pdf"
              multiple
              onChange={handleFileUpload}
              disabled={uploadingFiles}
              style={{ display: 'none' }}
              id="file-upload-detail"
            />
            <AnimatedButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('file-upload-detail').click();
              }}
              disabled={uploadingFiles}
              variant="secondary"
              className="upload-button"
            >
              {uploadingFiles ? (
                <>
                  <LoadingSpinner size="small" />
                  Uploading...
                </>
              ) : (
                '📁 Add Floor Plan (PDF/DWG)'
              )}
            </AnimatedButton>
          </div>

          {(project.floor_plan_files || []).length > 0 ? (
            <div className="floor-plan-files-list">
              {project.floor_plan_files.map((file, idx) => (
                <div key={`file-${idx}`} className="floor-plan-file-item">
                  <div className="file-info">
                    <span className="file-icon">
                      {file.file_type === 'pdf' ? '📄' : '📐'}
                    </span>
                    <div className="file-details">
                      <div className="file-name">{file.filename}</div>
                      <div className="file-meta">
                        {file.file_type.toUpperCase()} •{' '}
                        {file.uploaded_at
                          ? new Date(file.uploaded_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Unknown date'}
                      </div>
                    </div>
                  </div>
                  <a
                    href={`${API_URL}/projects/${id}/floor-plans/${idx}/download`}
                    className="download-button"
                    download
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="floor-plans-empty">
              <p>No floor plans uploaded yet.</p>
              <p className="muted">Click "Add Floor Plan" to upload PDF or DWG files for each floor of this house.</p>
            </div>
          )}

          {/* Legacy text-based plans - show if they exist */}
          {(project.floor_plans || []).length > 0 && (
            <div className="floor-plans-legacy">
              <h3 style={{ fontSize: '1rem', color: '#9fb2c8', marginBottom: '12px' }}>
                Additional Notes
              </h3>
              <div className="floor-plan-badges">
                {project.floor_plans.map((plan, idx) => (
                  <span key={`text-${idx}`} className="badge">
                    {plan}
                  </span>
                ))}
              </div>
            </div>
          )}
          </section>
        </SpotlightCard>

        {/* Notes Section */}
        <SpotlightCard className="project-detail-section-wrapper">
          <section className="project-detail-section">
          <div className="section-header">
            <h2>Notes</h2>
            {!editingNotes && (
              <button
                className="edit-button"
                onClick={() => setEditingNotes(true)}
              >
                Edit
              </button>
            )}
          </div>
          {editingNotes ? (
            <div className="notes-editor">
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder="Add project notes..."
                rows={6}
                className="notes-textarea"
              />
              <div className="notes-actions">
                <button
                  className="ghost-link"
                  onClick={() => {
                    setNotesValue(project.notes || '');
                    setEditingNotes(false);
                  }}
                >
                  Cancel
                </button>
                <button className="primary" onClick={handleSaveNotes}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="notes-display">
              {project.notes ? (
                <p style={{ whiteSpace: 'pre-wrap' }}>{project.notes}</p>
              ) : (
                <p className="muted">No notes yet. Click Edit to add some.</p>
              )}
            </div>
          )}
          </section>
        </SpotlightCard>

        {/* Project Status */}
        <SpotlightCard className="project-detail-section-wrapper">
          <section className="project-detail-section">
          <h2>Project Information</h2>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Status</span>
              <span className={`status-value ${project.completed ? 'completed' : 'open'}`}>
                {project.completed ? '✓ Completed' : '○ In Progress'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Total Floor Plans</span>
              <span className="status-value">
                {(project.floor_plan_files || []).length} file{(project.floor_plan_files || []).length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Project ID</span>
              <span className="status-value">#{project.id}</span>
            </div>
          </div>
          </section>
        </SpotlightCard>
      </div>
    </div>
  );
}

