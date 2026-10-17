import React, { useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PageTitle from '../../components/shared/PageTitle';
import StatusBadge from '../../components/ui/StatusBadge';
import Avatar from '../../components/ui/Avatar';

const avatarFor = (student) => student.avatar || student.photoURL || student.photoUrl || student.avatarUrl || student.avatarURL || student.profileImage || student.profileImageUrl || '';
const coverFor = (student) => student.coverUrl || student.coverPhotoUrl || student.coverImageUrl || student.coverURL || student.bannerUrl || '';
const aboutFor = (student) => student.about || student.bio || student.introduction || '';
const usernameFor = (student) => student.username ? `@${String(student.username).replace(/^@/, '')}` : `@${String(student.email || 'student').split('@')[0]}`;

/**
 * Profile preview is portalled to document.body and positioned against the View
 * button. This intentionally avoids clipping from the table's overflow:auto
 * container while keeping the same profile-card hierarchy as student settings.
 */
function StudentView({ student }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 90, left: 24, placement: 'below' });
  const hoverTimer = useRef(null);
  const closeTimer = useRef(null);
  const triggerRef = useRef(null);
  const cardRef = useRef(null);

  const placeCard = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.min(360, window.innerWidth - 24);
    const maxHeight = Math.max(260, window.innerHeight - 32);
    const estimatedHeight = Math.min(570, maxHeight);
    let left = rect.left;
    if (left + width > window.innerWidth - 12) left = rect.right - width;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    let top = rect.bottom + 9;
    let placement = 'below';
    if (top + estimatedHeight > window.innerHeight - 12 && rect.top - estimatedHeight - 9 >= 12) {
      top = rect.top - estimatedHeight - 9;
      placement = 'above';
    }
    top = Math.max(12, Math.min(top, window.innerHeight - Math.min(estimatedHeight, maxHeight) - 12));
    setPosition({ top, left, width, maxHeight, placement });
  }, []);

  const show = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    placeCard();
    setOpen(true);
  }, [placeCard]);
  const startHover = () => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(show, 700);
  };
  const closeSoon = () => {
    window.clearTimeout(hoverTimer.current);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 180);
  };
  const toggle = () => {
    window.clearTimeout(hoverTimer.current);
    window.clearTimeout(closeTimer.current);
    if (open) setOpen(false); else show();
  };
  React.useEffect(() => {
    if (!open) return undefined;
    const reposition = () => placeCard();
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open, placeCard]);
  React.useEffect(() => () => {
    window.clearTimeout(hoverTimer.current);
    window.clearTimeout(closeTimer.current);
  }, []);

  const name = student.name || student.displayName || 'Profile incomplete';
  const avatar = avatarFor(student);
  const cover = coverFor(student);
  const about = aboutFor(student);
  const details = [
    ['TRACK', student.track || 'Not selected'],
    ['UNIVERSITY', student.university || student.institute || 'Not added'],
    ['EDUCATION', student.education || student.educationLevel || 'Not added'],
    ['PORTFOLIO', student.portfolioUrl || student.portfolio || 'Not added'],
  ];

  return <div className="student-view-wrap" onMouseEnter={startHover} onMouseLeave={closeSoon}>
    <button ref={triggerRef} type="button" className="btn btn-small btn-secondary" aria-expanded={open} aria-haspopup="dialog" onFocus={show} onBlur={(e) => { if (!cardRef.current?.contains(e.relatedTarget)) closeSoon(); }} onClick={toggle}>View</button>
    {open && createPortal(
      <div
        ref={cardRef}
        className={`student-hover-card student-hover-card-full student-hover-card-${position.placement}`}
        role="dialog"
        aria-label={`${name} profile preview`}
        style={{ position: 'fixed', top: position.top, left: position.left, width: position.width || 360, maxHeight: position.maxHeight || 'calc(100vh - 24px)', zIndex: 2147483000 }}
        onMouseEnter={() => { window.clearTimeout(closeTimer.current); window.clearTimeout(hoverTimer.current); }}
        onMouseLeave={closeSoon}
      >
        <div className="student-hover-cover student-hover-cover-full">
          {cover ? <img src={cover} alt={`${name} cover`} onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <div className="student-hover-cover-placeholder"><span>✦</span><small>PROFILE COVER</small></div>}
        </div>
        <div className="student-hover-content student-hover-content-full">
          <div className="student-hover-avatar-ring"><Avatar name={name} url={avatar} size="lg" /></div>
          <div className="student-hover-profile-heading">
            <div><small className="student-hover-username">{usernameFor(student)}</small><h2>{name}</h2></div>
            <span className="student-hover-role">STUDENT</span>
          </div>
          <p className="student-hover-bio">{about || 'This student has not added an introduction yet.'}</p>
          <dl className="student-hover-details">
            <div><dt>EMAIL</dt><dd>{student.email || '—'}</dd></div>
            {details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            <div><dt>BATCH</dt><dd>{student.batch && student.batch !== 'Unassigned' ? student.batch : 'Unassigned'}</dd></div>
          </dl>
          <div className="student-hover-footer"><span><i /> Live student profile</span><small>Updates from saved profile</small></div>
        </div>
      </div>,
      document.body
    )}
  </div>;
}

export default function StudentsPage({ students, onEdit, onToggle }) {
  const [search, setSearch] = useState('');
  const rows = students.filter((s) => `${s.name || ''} ${s.email || ''} ${s.uid || ''} ${s.username || ''}`.toLowerCase().includes(search.toLowerCase()));
  return <><PageTitle eyebrow="ADMIN / DIRECTORY" title="Student directory" description="Inspect applicant and student records, update allowed profile fields, and manage account status."/><div className="filter-bar"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, username…"/><span>{rows.length} people</span></div><section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>TRACK</th><th>BATCH</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{rows.map((s) => <tr key={s.id}><td><div className="student-directory-person"><Avatar name={s.name || s.email} url={avatarFor(s)}/><div><b>{s.name || 'Profile incomplete'}</b><small className="table-sub">{s.email}</small></div></div></td><td>{s.track || '—'}</td><td>{s.batch || 'Unassigned'}</td><td><StatusBadge status={s.status || 'Pending'}/></td><td><div className="inline-actions"><StudentView student={s}/><button className="btn btn-small btn-secondary" onClick={() => onEdit(s)}>Edit profile</button><button className="btn btn-small btn-secondary" onClick={() => onToggle(s)}>{s.status === 'Suspended' ? 'Restore' : 'Suspend'}</button></div></td></tr>)}</tbody></table></div>{!rows.length && <div className="empty-state">No student records found.</div>}</section></>;
}
