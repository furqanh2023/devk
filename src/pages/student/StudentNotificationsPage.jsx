import React from 'react';
import PageTitle from '../../components/shared/PageTitle';

function displayDate(value) {
  if (!value) return 'Recently published';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function StudentNotificationsPage({ announcements = [], notifications = [] }) {
  const items = [
    ...notifications.map((item) => ({ ...item, _kind: 'notification' })),
    ...announcements.map((item) => ({ ...item, _kind: 'announcement' }))
  ].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime() || 0;
    const dateB = new Date(b.createdAt || 0).getTime() || 0;
    return dateB - dateA;
  });
  return <><PageTitle eyebrow="STUDENT PORTAL / UPDATES" title="Notifications & announcements" description="Read your personal application updates and announcements shared by the DEVK internship team."/><section className="panel student-updates-panel">{items.map((item) => <article className="announcement-item student-update-item" key={`${item._kind}-${item.id}`}><div className="announcement-meta"><span className={`update-type update-type-${item._kind}`}>{item._kind === 'notification' ? 'Personal notification' : 'Announcement'}</span>{item.read === false && <i className="update-new-badge">New</i>}</div><h3>{item.title || (item._kind === 'notification' ? 'Notification' : 'Announcement')}</h3><p>{item.body || ''}</p><time>{displayDate(item.createdAt)}</time></article>)}{!items.length && <div className="empty-state">There are no notifications or announcements yet.</div>}</section></>;
}
