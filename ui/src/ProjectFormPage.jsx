import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { API_URL } from './config';
import LocationAutocomplete from './LocationAutocomplete';
import './ProjectFormPage.css';

export default function ProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    location: '',
    locationData: null,
    floorPlans: '',
    notes: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [existingFiles, setExistingFiles] = useState([]);

  useEffect(() => {
    if (isEditMode) {
      fetchProject();
    }
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
      setFormData({
        location: data.location || '',
        locationData: data.location_data || null,
        floorPlans: (data.floor_plans || []).join(', '),
        notes: data.notes || '',
      });
      setExistingFiles(data.floor_plan_files || []);
    } catch (err) {
      console.error(err);
      setError('Could not load project.');
    } finally {
      setLoading(false);
    }
  };

  // Extract simplified street address from full address
  const extractSimplifiedAddress = (fullAddress, locationData) => {
    if (!fullAddress) return '';
    
    if (locationData?.address) {
      const address = locationData.address;
      const parts = address.split(',');
      if (parts.length > 0) {
        return parts[0].trim();
      }
    }
    
    const parts = fullAddress.split(',');
    return parts[0].trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.location.trim()) {
      setError('Location is required.');
      return;
    }
    if (!isEditMode && selectedFiles.length === 0 && existingFiles.length === 0) {
      setError('At least one floor plan file (PDF or DWG) is required.');
      return;
    }

    setSaving(true);
    setError('');

    const floor_plans = formData.floorPlans
      .split(',')
      .map((plan) => plan.trim())
      .filter(Boolean);

    const simplifiedTitle = extractSimplifiedAddress(formData.location, formData.locationData);

    try {
      let projectId = id;
      
      if (isEditMode) {
        // Update existing project
        const res = await fetch(`${API_URL}/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: simplifiedTitle || formData.location.split(',')[0].trim(),
            location: formData.location,
            location_data: formData.locationData,
            floor_plans,
            notes: formData.notes || null,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to update project');
        }
      } else {
        // Create new project
        const res = await fetch(`${API_URL}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: simplifiedTitle || formData.location.split(',')[0].trim(),
            location: formData.location,
            location_data: formData.locationData,
            floor_plans,
            notes: formData.notes || null,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to create project');
        }

        const newProject = await res.json();
        projectId = newProject.id;

        // Upload new files
        if (selectedFiles.length > 0) {
          setUploadingFiles(true);
          for (const file of selectedFiles) {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const uploadRes = await fetch(`${API_URL}/projects/${projectId}/upload-floor-plan`, {
              method: 'POST',
              body: formDataUpload,
            });

            if (!uploadRes.ok) {
              throw new Error(`Failed to upload ${file.name}`);
            }
          }
          setUploadingFiles(false);
        }
      }

      // Navigate back to projects list
      navigate('/projects');
    } catch (err) {
      console.error(err);
      setError(`Could not save the project: ${err.message}`);
    } finally {
      setSaving(false);
      setUploadingFiles(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(
      (file) => file.name.toLowerCase().endsWith('.dwg') || file.name.toLowerCase().endsWith('.pdf')
    );

    if (validFiles.length === 0 && files.length > 0) {
      setError('Please select DWG or PDF files only.');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setError('');
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = async (fileIndex) => {
    // For now, just remove from UI - in production you'd call DELETE endpoint
    setExistingFiles((prev) => prev.filter((_, i) => i !== fileIndex));
  };

  if (loading) {
    return (
      <div className="project-form-page">
        <div className="project-form-loading">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="project-form-page">
      <header className="project-form-header">
        <div>
          <Link to="/projects" className="back-link">
            ← Back to Projects
          </Link>
          <h1>{isEditMode ? 'Edit Project' : 'New Project'}</h1>
          <p className="muted">
            {isEditMode ? 'Update project details' : 'Create a new project for a house'}
          </p>
        </div>
      </header>

      {error && <div className="banner error">{error}</div>}

      <section className="project-form-card">
        <form className="project-form-content" onSubmit={handleSubmit}>
          <label>
            Location *
            <LocationAutocomplete
              value={formData.location}
              onChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
              onLocationSelect={(locationData) =>
                setFormData((prev) => ({ ...prev, locationData }))
              }
            />
            <small style={{ color: '#7f90a8', marginTop: '4px', display: 'block' }}>
              The project title will be automatically set to the simplified street address
            </small>
          </label>

          <label>
            Floor Plan Files {!isEditMode && '(Required)'} *
            <input
              type="file"
              accept=".dwg,.pdf"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="floor-plan-upload"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('floor-plan-upload').click();
                }}
                className="upload-floor-plan-button"
                style={{ width: 'fit-content' }}
              >
                Select Floor Plan Files (PDF/DWG)
              </button>
              
              {/* Existing files */}
              {existingFiles.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#7f90a8', marginBottom: '8px' }}>
                    Existing files ({existingFiles.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {existingFiles.map((file, idx) => (
                      <div
                        key={`existing-${idx}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: '#0a0e14',
                          border: '1px solid #1f2a3a',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                        }}
                      >
                        <span style={{ color: '#eef2f7' }}>
                          {file.filename} ({file.file_type.toUpperCase()})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingFile(idx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ff6b6b',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            fontSize: '0.85rem',
                          }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New files */}
              {selectedFiles.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#7f90a8', marginBottom: '8px' }}>
                    New files ({selectedFiles.length}):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: '#0a0e14',
                          border: '1px solid #1f2a3a',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                        }}
                      >
                        <span style={{ color: '#eef2f7' }}>
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ff6b6b',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            fontSize: '0.85rem',
                          }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </label>

          <label>
            Additional Notes (optional)
            <input
              type="text"
              value={formData.floorPlans}
              onChange={(e) => setFormData((prev) => ({ ...prev, floorPlans: e.target.value }))}
              placeholder="Optional tags or notes, e.g. Basement, Attic, etc."
            />
          </label>

          <label>
            Notes
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional project notes..."
              rows={3}
              style={{
                background: '#0a0e14',
                border: '1px solid #1f2a3a',
                color: '#eef2f7',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="ghost-link"
              onClick={() => navigate('/projects')}
            >
              Cancel
            </button>
            <button type="submit" className="primary" disabled={saving || uploadingFiles}>
              {saving || uploadingFiles ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

