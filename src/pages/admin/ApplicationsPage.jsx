import React, { useMemo, useState } from 'react';
import PageTitle from '../../components/shared/PageTitle';
import StatusBadge from '../../components/ui/StatusBadge';
import Avatar from '../../components/ui/Avatar';

export default function ApplicationsPage({ applications, enrollmentRequests = [], onDecision, onEnrollmentDecision }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [workingId, setWorkingId] = useState('');
  const [workingRequestId, setWorkingRequestId] = useState('');
  const rows = useMemo(() => applications.filter((a) => `${a.name || ''} ${a.email || ''} ${a.uid || ''} ${a.track || ''}`.toLowerCase().includes(search.toLowerCase())).filter((a) => status === 'All' || a.status === status), [applications, search, status]);
  const reEnrollmentRows = useMemo(() => enrollmentRequests.filter((request) => `${request.name || ''} ${request.email || ''} ${request.uid || ''} ${request.requestedTrack || ''} ${request.completedTrack || ''} ${request.completedCertificateId || ''}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => (a.status === 'Pending' ? -1 : 0) - (b.status === 'Pending' ? -1 : 0) || String(b.requestedAt || '').localeCompare(String(a.requestedAt || ''))), [enrollmentRequests, search]);
  const decide = async (app, nextStatus) => {
    if (workingId || app.status === nextStatus || app.status === 'Completed') return;
    setWorkingId(app.id);
    try { await onDecision(app, nextStatus); }
    finally { setWorkingId(''); }
  };
  const decideReEnrollment = async (request, nextStatus) => {
    if (workingRequestId || request.status !== 'Pending') return;
    setWorkingRequestId(request.id);
    try { await onEnrollmentDecision(request, nextStatus); }
    finally { setWorkingRequestId(''); }
  };
  const exportCsv = () => {
    const data = [['Name', 'Email', 'Track', 'Status', 'Submitted'], ...rows.map((a) => [a.name, a.email, a.track, a.status, a.submittedAt])];
    const csv = data.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'devk-applications.csv'; link.click(); URL.revokeObjectURL(url);
  };
  return <>
    <PageTitle eyebrow="ADMIN / PEOPLE" title="Applications" description="Review new applicants and approve next-internship requests from previously certified students." actions={<button className="btn btn-secondary" onClick={exportCsv}>↓ Export CSV</button>} />

    <section className="panel reenrollment-admin-panel">
      <div className="panel-heading"><div><h2>Next internship requests</h2><p>Live requests from students who have completed a certified internship. Approval makes them eligible for a new batch.</p></div><span className="count-pill">{enrollmentRequests.filter(request => request.status === 'Pending').length} pending</span></div>
      {reEnrollmentRows.length ? <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>PREVIOUS COMPLETION</th><th>REQUESTED TRACK</th><th>CYCLE</th><th>STATUS</th><th>REVIEW</th></tr></thead><tbody>{reEnrollmentRows.map(request => {
        const busy = workingRequestId === request.id;
        const pending = request.status === 'Pending';
        return <tr key={request.id}>
          <td><div className="student-directory-person"><Avatar name={request.name || request.email}/><div><b>{request.name || 'Student'}</b><small className="table-sub">{request.email || request.uid}</small></div></div></td>
          <td><div className="previous-completion-cell"><span className="previous-completion-badge">✓ Internship completed</span><b>{request.completedTrack || 'Completed track'}</b><small className="table-sub">{request.completedCertificateId ? `Certificate: ${request.completedCertificateId}` : 'Verified completion record'}</small><small className="table-sub">Previous batch: {request.previousBatch || 'Not recorded'}</small></div></td>
          <td><b>{request.requestedTrack || 'Track not selected'}</b><small className="table-sub">Requested {String(request.requestedAt || '—').slice(0, 10)}</small></td>
          <td><span className="cycle-pill">Cycle {request.cycleNumber || '—'}</span></td>
          <td><StatusBadge status={request.status || 'Pending'}/>{request.reviewReason && <small className="table-sub">{request.reviewReason}</small>}</td>
          <td><div className="inline-actions">{pending ? <><button className="btn btn-small btn-primary" disabled={busy} onClick={() => decideReEnrollment(request, 'Approved')}>{busy ? 'Saving…' : 'Approve next cycle'}</button><button className="btn btn-small btn-danger" disabled={busy} onClick={() => decideReEnrollment(request, 'Rejected')}>Reject</button></> : <span className="table-sub">{request.reviewedAt ? `Reviewed ${String(request.reviewedAt).slice(0, 10)}` : 'Reviewed'}</span>}</div></td>
        </tr>;
      })}</tbody></table></div> : <div className="empty-state"><b>No next-internship requests yet</b><p>When a student receives a completion certificate and applies for another program, the request will appear here automatically.</p></div>}
    </section>

    <div className="filter-bar"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, UID or track…"/><select value={status} onChange={(e) => setStatus(e.target.value)}>{['All', 'Pending', 'Approved', 'Rejected', 'Suspended', 'Completed'].map((s) => <option key={s}>{s}</option>)}</select><span>{rows.length} records</span></div>
    <section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>APPLICANT</th><th>TRACK</th><th>SUBMITTED</th><th>STATUS</th><th>DECISION</th></tr></thead><tbody>{rows.map((a) => { const approved = a.status === 'Approved'; const rejected = a.status === 'Rejected'; const completed = a.status === 'Completed' || a.internshipCompleted === true; const busy = workingId === a.id; return <tr key={a.id}><td><div className="student-directory-person"><Avatar name={a.name || a.email} url={a.avatar || a.photoURL || a.avatarUrl || a.avatarURL || a.profileImage || a.profileImageUrl || ''}/><div><b>{a.name || 'Name not completed'}</b>{a.hasCompletedInternship && <span className="previous-completion-badge applicant-completion-badge">✓ Previously completed · {a.completedInternshipTrack || 'Internship'}</span>}<small className="table-sub">{a.email || a.uid}</small></div></div></td><td>{a.track || 'Not selected'}</td><td>{a.submittedAt?.toDate?.()?.toLocaleDateString?.() || String(a.submittedAt || '—').slice(0, 10)}</td><td><StatusBadge status={a.status}/>{a.reviewReason && <small className="table-sub">Reason: {a.reviewReason}</small>}</td><td><div className="inline-actions">{completed ? <span className="previous-completion-badge">✓ Cycle completed</span> : <><button className={`btn btn-small ${approved ? 'btn-decision-done' : 'btn-primary'}`} disabled={busy || approved} aria-pressed={approved} title={approved ? 'Already approved' : 'Approve this application'} onClick={() => decide(a, 'Approved')}>{busy ? 'Saving…' : approved ? '✓ Approved' : 'Approve'}</button><button className={`btn btn-small ${rejected ? 'btn-decision-done' : 'btn-danger'}`} disabled={busy || rejected} aria-pressed={rejected} title={rejected ? 'Already rejected' : 'Reject this application'} onClick={() => decide(a, 'Rejected')}>{busy ? 'Saving…' : rejected ? 'Rejected' : 'Reject'}</button></>}</div></td></tr>;})}</tbody></table></div>{rows.length === 0 && <div className="empty-state"><b>No applications found</b><p>Try a different status or search term.</p></div>}</section>
  </>;
}
