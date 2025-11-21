import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from './config';
import AnimatedText from './components/AnimatedText';
import AnimatedButton from './components/AnimatedButton';
import SpotlightCard from './components/react-bits/SpotlightCard';
import LoadingSpinner from './components/LoadingSpinner';
import StatusIndicator from './components/StatusIndicator';
import './Projects.css';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/projects`);
      if (!res.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
      setError('Could not load projects right now.');
    } finally {
      setLoading(false);
    }
  };


  const toggleCompleted = async (projectId, completed) => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) {
        throw new Error('Failed to update project');
      }
      const updated = await res.json();
      setProjects((prev) =>
        prev.map((project) => (project.id === updated.id ? updated : project)),
      );
    } catch (err) {
      console.error(err);
      setError('Could not update project status.');
    }
  };

  const projectSummary = useMemo(
    () => ({
      total: projects.length,
      completed: projects.filter((project) => project.completed).length,
    }),
    [projects],
  );

  return (
    <div className="projects-page">
      <header className="projects-header">
        <div>
          <AnimatedText variant="fade-up" delay={0.1} as="p" className="eyebrow">
            Project Library
          </AnimatedText>
          <AnimatedText variant="fade-up" delay={0.2} as="h1">
            Projects
          </AnimatedText>
          <AnimatedText variant="fade-up" delay={0.3} as="p" className="muted">
            Keep track of locations, linked floor plans, and job readiness.
          </AnimatedText>
        </div>
        <AnimatedText variant="fade-up" delay={0.2}>
          <Link className="ghost-link" to="/">
            ← Back to Controls
          </Link>
        </AnimatedText>
      </header>

      <SpotlightCard>
        <div className="projects-toolbar">
          <AnimatedButton
            variant="secondary"
            size="medium"
            onClick={() => navigate('/projects/new')}
            className="new-project-button"
          >
            New Project
          </AnimatedButton>
          <div className="project-tally">
            <span className="pill neutral">Total {projectSummary.total}</span>
            <span className="pill success">Ready {projectSummary.completed}</span>
          </div>
        </div>

        {error && <div className="banner error">{error}</div>}

        {loading ? (
          <div className="projects-empty">
            <LoadingSpinner size="medium" />
            <p style={{ marginTop: '16px' }}>Loading projects…</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="projects-empty">
            <p>No projects yet.</p>
            <p className="muted">Use "New Project" to start one.</p>
          </div>
        ) : (
          <div className="projects-table-container">
            <table className="projects-table">
              <thead>
                <tr>
                  <th className="table-col-checkbox"></th>
                  <th className="table-col-title">Title</th>
                  <th className="table-col-notes">Notes</th>
                  <th className="table-col-files">Files</th>
                  <th className="table-col-status">Status</th>
                  <th className="table-col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className={`table-row ${project.completed ? 'completed' : ''}`}>
                    <td className="table-col-checkbox">
                      <label className="table-checkbox">
                        <input
                          type="checkbox"
                          checked={project.completed}
                          onChange={(e) => toggleCompleted(project.id, e.target.checked)}
                        />
                        <span />
                      </label>
                    </td>
                    <td className="table-col-title">
                      <div className="table-cell-title">{project.title}</div>
                    </td>
                    <td className="table-col-notes">
                      <div className="table-cell-notes" title={project.notes || ''}>
                        {project.notes || '—'}
                      </div>
                    </td>
                    <td className="table-col-files">
                      <div className="table-cell-files">
                        {((project.floor_plans || []).length > 0 || (project.floor_plan_files || []).length > 0) ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                            {(project.floor_plan_files || []).length > 0 && (
                              <span className="file-count">
                                {(project.floor_plan_files || []).length} file{(project.floor_plan_files || []).length !== 1 ? 's' : ''}
                              </span>
                            )}
                            {(project.floor_plans || []).length > 0 && (
                              <span className="file-tags" style={{ fontSize: '0.75rem', color: '#7f90a8' }}>
                                {(project.floor_plans || []).join(', ')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="muted">No files</span>
                        )}
                      </div>
                    </td>
                    <td className="table-col-status">
                      <StatusIndicator
                        status={project.completed ? 'completed' : 'idle'}
                        label={project.completed ? 'Completed' : 'In Progress'}
                        pulse={!project.completed}
                        className="badge"
                      />
                    </td>
                     <td className="table-col-actions">
                       <Link
                         to={`/projects/${project.id}/edit`}
                         className="table-action-link"
                       >
                         View
                       </Link>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SpotlightCard>
    </div>
  );
}

