import React, { useEffect, useState } from 'react';
import PageTitle from '../../components/shared/PageTitle';
import StatusBadge from '../../components/ui/StatusBadge';
import ImageUrlPreview from '../../components/shared/ImageUrlPreview';

export default function StudentSettingsPage({ user, application, onSave, onPasswordReset }) {
  const [name, setName] = useState(application?.name || user.displayName || '');
  const [username, setUsername] = useState(application?.username || '');
  const [avatar, setAvatar] = useState(application?.avatar || user.photoURL || '');
  const [coverUrl, setCoverUrl] = useState(application?.coverUrl || '');
  const [track, setTrack] = useState(application?.track || 'Frontend Development');
  const [phone, setPhone] = useState(application?.phone || '');
  const [university, setUniversity] = useState(application?.university || '');
  const [education, setEducation] = useState(application?.education || '');
  const [portfolioUrl, setPortfolioUrl] = useState(application?.portfolioUrl || '');
  const [about, setAbout] = useState(application?.about || '');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!application) return; setName(application.name || user.displayName || ''); setUsername(application.username || ''); setAvatar(application.avatar || user.photoURL || ''); setCoverUrl(application.coverUrl || ''); setTrack(application.track || 'Frontend Development'); setPhone(application.phone || ''); setUniversity(application.university || ''); setEducation(application.education || ''); setPortfolioUrl(application.portfolioUrl || ''); setAbout(application.about || ''); }, [application?.updatedAt, application?.name, application?.username, application?.avatar, application?.coverUrl, application?.track, application?.phone, application?.university, application?.education, application?.portfolioUrl, application?.about, user.displayName, user.photoURL]);
  const fullName = name || user.displayName || 'Your name';
  const userName = username ? `@${username.replace(/^@/, '')}` : `@${(user.email || 'student').split('@')[0]}`;
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try { await onSave({ name, username, avatar, coverUrl, track, phone, university, education, portfolioUrl, about, profileCompleted: true }); }
    finally { setSaving(false); }
  };
  return <><PageTitle eyebrow="STUDENT PORTAL / ACCOUNT" title="Profile & settings" description="Build your student profile, preview your images, and manage account security."/>
    <div className="profile-settings-grid">
      <section className="panel settings-card profile-editor-card"><div className="settings-section-heading"><div><h2>Profile details</h2><p>Changes preview instantly. Use public HTTPS image URLs; uploads are not used on the Spark plan.</p></div><span className="live-pill"><i/> Live preview</span></div>
        <form onSubmit={save}>
          <label className="form-field">Full name<input value={name} onChange={(e) => setName(e.target.value)} required minLength="2" maxLength="100"/></label>
          <label className="form-field">Username<input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '').replace(/^@/, ''))} maxLength="30" placeholder="your.username"/><small>Letters, numbers, underscores and periods.</small></label>
          <label className="form-field">Profile picture URL<input type="url" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://example.com/profile.jpg"/><small>Square images work best; the preview uses a circular crop.</small></label>
          <ImageUrlPreview url={avatar} name={fullName} kind="avatar" label="PROFILE PHOTO"/>
          <label className="form-field">Cover photo URL<input type="url" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://example.com/cover.jpg"/><small>Wide landscape images work best; the preview crops to a banner.</small></label>
          <ImageUrlPreview url={coverUrl} name={fullName} kind="cover" label="COVER PHOTO"/>
          <label className="form-field">Internship track<select disabled={Boolean(application?.status && application.status !== 'Pending')} value={track} onChange={(e) => setTrack(e.target.value)}>{['Frontend Development', 'Backend Development', 'UI/UX Design', 'QA & Testing', 'Data Analytics', 'AI / Machine Learning'].map((t) => <option key={t}>{t}</option>)}</select>{application?.status && application.status !== 'Pending' && <small>Track changes are locked after an application decision. Contact DEVK if this needs correction.</small>}</label>
          <label className="form-field">Phone (optional)<input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" maxLength="30"/></label>
          <label className="form-field">University / institute<input value={university} onChange={(e) => setUniversity(e.target.value)} maxLength="120"/></label>
          <label className="form-field">Education level<input value={education} onChange={(e) => setEducation(e.target.value)} maxLength="80"/></label>
          <label className="form-field">Portfolio URL<input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://…"/></label>
          <label className="form-field">About you<textarea rows="4" maxLength="600" value={about} onChange={(e) => setAbout(e.target.value)} placeholder="Tell the DEVK team a little about yourself…"/></label>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving profile…' : 'Save profile'}</button>
        </form>
      </section>
      <aside className="student-profile-preview-column"><section className="student-social-card"><div className="social-cover"><ImageUrlPreview url={coverUrl} name={fullName} kind="cover" label="PROFILE COVER"/></div><div className="social-profile-body"><div className="social-avatar-overlap"><ImageUrlPreview url={avatar} name={fullName} kind="avatar" label="PROFILE PHOTO"/></div><div className="social-name-block"><div><small className="social-username">{userName}</small><h2>{fullName}</h2></div><span className="social-profile-tag">STUDENT</span></div><p className="social-bio">{about.trim() || 'Your introduction will appear here when you add it to your profile.'}</p><div className="social-profile-details"><div><span>TRACK</span><b>{track || 'Not selected'}</b></div><div><span>UNIVERSITY</span><b>{university || 'Not added'}</b></div><div><span>EDUCATION</span><b>{education || 'Not added'}</b></div><div><span>PORTFOLIO</span><b className="profile-detail-value">{portfolioUrl || 'Not added'}</b></div></div><div className="social-profile-footer"><span><i/> Profile preview</span><small>Visible to you in this editor</small></div></div></section><div className="profile-tip"><span>✦</span><div><b>Make your profile yours</b><p>Choose a clear square portrait and a wide cover image. The preview automatically crops both to fit.</p></div></div></aside>
    </div>
    <section className="panel settings-card security-card-below"><div className="settings-section-heading"><div><h2>Account & security</h2><p>Authentication and passwords are managed securely by Firebase.</p></div><StatusBadge status="Protected"/></div><div className="security-grid"><div className="security-item"><span>✉</span><div><b>Email address</b><small>{user.email}</small></div><StatusBadge status={user.emailVerified ? 'Verified' : 'Unverified'}/></div><div className="security-item"><span>✓</span><div><b>Remember this browser</b><small>Your session stays active until you log out.</small></div><StatusBadge status="Enabled"/></div><div className="security-item"><span>⌁</span><div><b>Account ID</b><small className="uid-value">{user.uid}</small></div></div></div><button className="btn btn-secondary" onClick={() => onPasswordReset(user.email)}>Send password reset email</button></section>
  </>;
}
