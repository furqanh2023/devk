import React, { useMemo, useState } from 'react';
import PageTitle from '../../components/shared/PageTitle';
import StatusBadge from '../../components/ui/StatusBadge';
import Avatar from '../../components/ui/Avatar';

export default function ApplicationsPage({ applications, onDecision }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [workingId, setWorkingId] = useState('');
  const rows = useMemo(() => applications.filter((a) => `${a.name || ''} ${a.email || ''} ${a.uid || ''} ${a.track || ''}`.toLowerCase().includes(search.toLowerCase())).filter((a) => status === 'All' || a.status === status), [applications, search, status]);
  const decide = async (app, nextStatus) => {
    if (workingId || app.status === nextStatus) return;
    setWorkingId(app.id);
    try { await onDecision(app, nextStatus); }
    finally { setWorkingId(''); }
  };
  const exportCsv = () => {
    const data = [['Name', 'Email', 'Track', 'Status', 'Submitted'], ...rows.map((a) => [a.name, a.email, a.track, a.status, a.submittedAt])];
    const csv = data.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'devk-applications.csv'; link.click(); URL.revokeObjectURL(url);
  };
  return <><PageTitle eyebrow="ADMIN / PEOPLE" title="Applications" description="Review submitted applicant profiles, record decisions, and keep an auditable intake queue." actions={<button className="btn btn-secondary" onClick={exportCsv}>↓ Export CSV</button>}/>
    <div className="filter-bar"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, UID or track…"/><select value={status} onChange={(e) => setStatus(e.target.value)}>{['All', 'Pending', 'Approved', 'Rejected', 'Suspended'].map((s) => <option key={s}>{s}</option>)}</select><span>{rows.length} records</span></div>
    <section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>APPLICANT</th><th>TRACK</th><th>SUBMITTED</th><th>STATUS</th><th>DECISION</th></tr></thead><tbody>{rows.map((a) => { const approved = a.status === 'Approved'; const rejected = a.status === 'Rejected'; const busy = workingId === a.id; return <tr key={a.id}><td><div className="student-directory-person"><Avatar name={a.name || a.email} url={a.avatar || a.photoURL || a.avatarUrl || a.avatarURL || a.profileImage || a.profileImageUrl || ''}/><div><b>{a.name || 'Name not completed'}</b><small className="table-sub">{a.email || a.uid}</small></div></div></td><td>{a.track || 'Not selected'}</td><td>{a.submittedAt?.toDate?.()?.toLocaleDateString?.() || String(a.submittedAt || '—').slice(0, 10)}</td><td><StatusBadge status={a.status}/>{a.reviewReason && <small className="table-sub">Reason: {a.reviewReason}</small>}</td><td><div className="inline-actions"><button className={`btn btn-small ${approved ? 'btn-decision-done' : 'btn-primary'}`} disabled={busy || approved} aria-pressed={approved} title={approved ? 'Already approved' : 'Approve this application'} onClick={() => decide(a, 'Approved')}>{busy ? 'Saving…' : approved ? '✓ Approved' : 'Approve'}</button><button className={`btn btn-small ${rejected ? 'btn-decision-done' : 'btn-danger'}`} disabled={busy || rejected} aria-pressed={rejected} title={rejected ? 'Already rejected' : 'Reject this application'} onClick={() => decide(a, 'Rejected')}>{busy ? 'Saving…' : rejected ? 'Rejected' : 'Reject'}</button></div></td></tr>;})}</tbody></table></div>{rows.length === 0 && <div className="empty-state"><b>No applications found</b><p>Try a different status or search term.</p></div>}</section>
  </>;
}
