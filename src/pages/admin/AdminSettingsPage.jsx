import React, { useState } from 'react';
import PageTitle from '../../components/shared/PageTitle';
import StatusBadge from '../../components/ui/StatusBadge';
import ImageUrlPreview from '../../components/shared/ImageUrlPreview';

function storedPrefs() { try { return JSON.parse(localStorage.getItem('devk.admin.preferences') || '{}'); } catch (e) { return {}; } }
export default function AdminSettingsPage({ user, onSave }) {
  const prefs = storedPrefs();
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [avatar, setAvatar] = useState(prefs.avatar || user.photoURL || '');
  const [coverUrl, setCoverUrl] = useState(prefs.coverUrl || '');
  const [emailAlerts, setEmailAlerts] = useState(prefs.emailAlerts !== false);
  const [saving, setSaving] = useState(false);
  const save = async (event) => { event.preventDefault(); setSaving(true); try { await onSave({ displayName, avatar, coverUrl, emailAlerts }); } catch (error) { /* App displays the actionable save error in its toast. */ } finally { setSaving(false); } };
  return <><PageTitle eyebrow="ADMIN / PREFERENCES" title="Admin profile & settings" description="Manage your administrator identity, image previews, and workspace preferences."/>
    <div className="profile-settings-grid admin-profile-settings-grid">
      <section className="panel settings-card profile-editor-card"><div className="settings-section-heading"><div><h2>Administrator profile</h2><p>Image previews update as you paste a public HTTPS URL.</p></div><span className="live-pill"><i/> Live preview</span></div><form onSubmit={save}>
        <label className="form-field">Display name<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength="100"/></label>
        <label className="form-field">Profile picture URL<input type="url" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://example.com/admin.jpg"/><small>Square portrait; displayed with a circular crop.</small></label><ImageUrlPreview url={avatar} name={displayName || user.email} kind="avatar" label="ADMIN PROFILE PHOTO"/>
        <label className="form-field">Cover photo URL<input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://example.com/admin-cover.jpg"/><small>Wide image; automatically cropped to the cover preview.</small></label><ImageUrlPreview url={coverUrl} name={displayName || user.email} kind="cover" label="ADMIN COVER PHOTO"/>
        <div className="security-item"><span>☼</span><div><b>Workspace appearance</b><small>Premium light theme · responsive layout</small></div></div>
        <label className="check-row"><input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)}/> Receive application-related email updates</label><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving settings…' : 'Save settings'}</button>
      </form></section>
      <aside className="student-profile-preview-column"><section className="student-social-card admin-social-card"><div className="social-cover"><ImageUrlPreview url={coverUrl} name={displayName || user.email} kind="cover" label="WORKSPACE COVER"/></div><div className="social-profile-body"><div className="social-avatar-overlap"><ImageUrlPreview url={avatar} name={displayName || user.email} kind="avatar" label="ADMIN PROFILE PHOTO"/></div><div className="social-name-block"><div><small className="social-username">@workspace-admin</small><h2>{displayName || 'Workspace admin'}</h2></div><span className="social-profile-tag admin-tag">ADMIN</span></div><p className="social-bio">Administrator of DEVK InternCore, managing internship applications, batches, and trusted certificate records.</p><div className="social-profile-details"><div><span>ROLE</span><b>Workspace administrator</b></div><div><span>EMAIL</span><b>{user.email}</b></div><div><span>AUTHENTICATION</span><b>Firebase secure sign-in</b></div></div><div className="social-profile-footer"><span><i/> Admin profile preview</span><small>Preview only</small></div></div></section><div className="profile-tip"><span>✦</span><div><b>Keep your workspace identity clear</b><p>Your avatar appears in the admin header and profile menu. Cover image is saved as a profile preference.</p></div></div></aside>
    </div>
    <section className="panel settings-card security-card-below"><div className="settings-section-heading"><div><h2>Security & session</h2><p>Sign-in state is stored in this browser until you explicitly log out.</p></div><StatusBadge status="Protected"/></div><div className="security-grid"><div className="security-item"><span>✓</span><div><b>Firebase local persistence</b><small>Remember this account on this browser</small></div><StatusBadge status="Enabled"/></div><div className="security-item"><span>✉</span><div><b>Email verification</b><small>{user.emailVerified ? 'Email verified' : 'Verify your email from the message sent by Firebase'}</small></div><StatusBadge status={user.emailVerified ? 'Verified' : 'Pending'}/></div><div className="security-item"><span>⌁</span><div><b>Account UID</b><small className="uid-value">{user.uid}</small></div></div></div></section>
  </>;
}
