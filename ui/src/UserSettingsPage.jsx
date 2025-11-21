import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { API_URL } from './config';
import './UserSettingsPage.css';

const SECTIONS = [
  {
    id: 'profile',
    title: 'Profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 9C11.0711 9 12.75 7.32107 12.75 5.25C12.75 3.17893 11.0711 1.5 9 1.5C6.92893 1.5 5.25 3.17893 5.25 5.25C5.25 7.32107 6.92893 9 9 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.72754 15.1875C3.72754 13.125 5.40647 11.4375 7.47754 11.4375H10.5225C12.5935 11.4375 14.2725 13.125 14.2725 15.1875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'business',
    title: 'Business',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6.75L9 3L15 6.75V14.25C15 14.6478 14.842 15.0294 14.5607 15.3107C14.2794 15.592 13.8978 15.75 13.5 15.75H4.5C4.10218 15.75 3.72064 15.592 3.43934 15.3107C3.15804 15.0294 3 14.6478 3 14.25V6.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 9.75V15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 12.75H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 1.5L3 4.5V8.25C3 12.1875 5.8125 15.75 9 16.5C12.1875 15.75 15 12.1875 15 8.25V4.5L9 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.5 9L8.25 9.75L10.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'preferences',
    title: 'Preferences',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 10.5C9.82843 10.5 10.5 9.82843 10.5 9C10.5 8.17157 9.82843 7.5 9 7.5C8.17157 7.5 7.5 8.17157 7.5 9C7.5 9.82843 8.17157 10.5 9 10.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.25 9C14.25 9.375 14.3625 9.75 14.5875 10.05L14.625 10.125C14.8125 10.3875 14.925 10.6875 14.925 11.025C14.925 11.8125 14.2875 12.45 13.5 12.45C13.1625 12.45 12.8625 12.3375 12.6 12.15L12.525 12.1125C12.225 11.8875 11.85 11.775 11.475 11.775C10.6875 11.775 10.05 12.4125 10.05 13.2C10.05 13.5375 10.1625 13.8375 10.35 14.1L10.3875 14.175C10.6125 14.475 10.725 14.85 10.725 15.225C10.725 16.0125 10.0875 16.65 9.3 16.65C8.5125 16.65 7.875 16.0125 7.875 15.225C7.875 14.85 7.9875 14.475 8.2125 14.175L8.25 14.1C8.4375 13.8375 8.55 13.5375 8.55 13.2C8.55 12.4125 7.9125 11.775 7.125 11.775C6.75 11.775 6.375 11.8875 6.075 12.1125L6 12.15C5.7375 12.3375 5.4375 12.45 5.1 12.45C4.3125 12.45 3.675 11.8125 3.675 11.025C3.675 10.6875 3.7875 10.3875 3.975 10.125L4.0125 10.05C4.2375 9.75 4.35 9.375 4.35 9C4.35 8.625 4.2375 8.25 4.0125 7.95L3.975 7.875C3.7875 7.6125 3.675 7.3125 3.675 6.975C3.675 6.1875 4.3125 5.55 5.1 5.55C5.4375 5.55 5.7375 5.6625 6 5.85L6.075 5.8875C6.375 6.1125 6.75 6.225 7.125 6.225C7.9125 6.225 8.55 5.5875 8.55 4.8C8.55 4.4625 8.4375 4.1625 8.25 3.9L8.2125 3.825C7.9875 3.525 7.875 3.15 7.875 2.775C7.875 1.9875 8.5125 1.35 9.3 1.35C10.0875 1.35 10.725 1.9875 10.725 2.775C10.725 3.15 10.6125 3.525 10.3875 3.825L10.35 3.9C10.1625 4.1625 10.05 4.4625 10.05 4.8C10.05 5.5875 10.6875 6.225 11.475 6.225C11.85 6.225 12.225 6.1125 12.525 5.8875L12.6 5.85C12.8625 5.6625 13.1625 5.55 13.5 5.55C14.2875 5.55 14.925 6.1875 14.925 6.975C14.925 7.3125 14.8125 7.6125 14.625 7.875L14.5875 7.95C14.3625 8.25 14.25 8.625 14.25 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function UserSettingsPage() {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    business_name: '',
    business_address: '',
    phone: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setError('Not authenticated');
        return;
      }

      const userData = JSON.parse(storedUser);
      const res = await fetch(`${API_URL}/users/me`, {
        headers: {
          'X-User-Id': userData.id?.toString() || '1',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await res.json();
      setFormData({
        name: data.name || '',
        email: data.email || '',
        business_name: data.business_name || '',
        business_address: data.business_address || '',
        phone: data.phone || '',
      });
    } catch (err) {
      console.error(err);
      setError('Could not load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setError('Not authenticated');
        return;
      }

      const userData = JSON.parse(storedUser);
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userData.id?.toString() || '1',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      const updated = await res.json();
      
      const updatedUser = {
        ...userData,
        ...updated,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      login(updatedUser);

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const currentSection = SECTIONS.find((s) => s.id === activeSection);

  if (loading) {
    return (
      <div className="user-settings-page">
        <div className="user-settings-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="user-settings-page">
      <header className="user-settings-header">
        <div>
          <h1>Account Settings</h1>
          <p className="muted">Manage your account information and preferences</p>
        </div>
        <Link to="/" className="ghost-link">
          ← Back to Controls
        </Link>
      </header>

      {error && <div className="banner error">{error}</div>}
      {success && <div className="banner success">{success}</div>}

      <div className="settings-layout">
        <aside className="settings-sidebar">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              className={`settings-section-button ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="section-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{section.icon}</span>
              <span className="section-title">{section.title}</span>
            </button>
          ))}
        </aside>

        <main className="settings-content">
          <div className="settings-content-header">
            <h2>{currentSection?.title || 'Settings'}</h2>
            <p className="settings-description">
              {activeSection === 'profile' && 'Update your personal information and contact details'}
              {activeSection === 'business' && 'Configure your business or company information and address'}
              {activeSection === 'security' && 'Change your password and manage security settings'}
              {activeSection === 'preferences' && 'Customize notification and display preferences'}
            </p>
          </div>

          <form className="settings-form" onSubmit={handleSubmit}>
            {activeSection === 'profile' && (
              <div className="form-section">
                <label>
                  Full Name
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                    required
                  />
                </label>
                <div className="form-row">
                  <label>
                    Email Address
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                    />
                  </label>
                  <label>
                    Phone Number
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'business' && (
              <div className="form-section">
                <label>
                  Business Name
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, business_name: e.target.value }))}
                    placeholder="Your business or company name"
                  />
                </label>
                <label>
                  Business Address
                  <textarea
                    value={formData.business_address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, business_address: e.target.value }))}
                    placeholder="Business address"
                    rows={4}
                    className="textarea-input"
                  />
                </label>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="form-section">
                <div className="info-box">
                  <p>Security settings are coming soon. This section will allow you to change your password and manage active sessions.</p>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="form-section">
                <div className="info-box">
                  <p>Preference settings are coming soon. This section will allow you to customize notifications and display settings.</p>
                </div>
              </div>
            )}

            {(activeSection === 'profile' || activeSection === 'business') && (
              <div className="form-actions">
                <Link to="/" className="ghost-link">
                  Cancel
                </Link>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
