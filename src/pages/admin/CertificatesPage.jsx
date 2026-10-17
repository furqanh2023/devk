import React, { useState } from 'react';
import PageTitle from '../../components/shared/PageTitle';
import StatusBadge from '../../components/ui/StatusBadge';

export default function CertificatesPage({ certificates, onRevoke, onIssue, onPrint }) {
  const [search, setSearch] = useState('');
  const rows = certificates.filter(c => `${c.certificateId || ''} ${c.serial || ''} ${c.studentName || ''} ${c.track || ''} ${c.batch || ''}`.toLowerCase().includes(search.toLowerCase()));
  return <>
    <PageTitle eyebrow="ADMIN / CREDENTIALS" title="Certificate registry" description="Review issued certificate records, their exact internship track and cycle, and revoke invalid credentials with a reason." actions={<button className="btn btn-primary" onClick={onIssue}>＋ Issue certificate</button>} />
    <div className="filter-bar"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search certificate ID, serial, student or track…"/><span>{rows.length} records</span></div>
    <section className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>CERTIFICATE</th><th>RECIPIENT</th><th>INTERNSHIP TRACK</th><th>BATCH</th><th>ISSUED</th><th>STATUS</th><th/></tr></thead><tbody>{rows.map(c => <tr key={c.id}>
      <td><b>{c.certificateId}</b><small className="table-sub">{c.serial}</small><small className="table-sub">{c.certificateType || 'Internship Completion'}</small></td>
      <td><b>{c.studentName}</b><small className="table-sub">{c.studentId || c.studentUid || 'Student ID not recorded'}</small></td>
      <td><span className="certificate-track-pill">✦ {c.track || 'Track not recorded'}</span><small className="table-sub">Cycle {c.cycleNumber || 1}</small></td>
      <td>{c.batch || 'Unassigned'}</td><td>{c.issueDate || '—'}</td><td><StatusBadge status={c.status}/></td>
      <td><div className="inline-actions"><button className="btn btn-small btn-secondary" onClick={() => onPrint(c)}>Print / PDF</button>{c.status === 'Valid' && <button className="btn btn-small btn-danger" onClick={() => onRevoke(c)}>Revoke</button>}</div></td>
    </tr>)}</tbody></table></div>{!rows.length && <div className="empty-state">No certificates found.</div>}</section>
  </>;
}
