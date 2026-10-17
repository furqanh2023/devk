import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../components/shared/PageTitle';
import StatusBadge from '../../components/ui/StatusBadge';

const TRACKS = ['Frontend Development', 'Backend Development', 'UI/UX Design', 'QA & Testing', 'Data Analytics', 'AI / Machine Learning'];

export default function StudentDashboard({ user, application, certificates, announcements, enrollmentRequests = [], onApplyNextInternship }) {
  const navigate = useNavigate();
  const [requestedTrack, setRequestedTrack] = useState(application?.track && TRACKS.includes(application.track) ? application.track : TRACKS[0]);
  const mine = useMemo(() => certificates.filter(c => (Boolean(c.studentUid) && c.studentUid === user.uid) || (Boolean(c.studentId) && c.studentId === user.uid)), [certificates, user.uid]);
  const validMine = mine.filter(c => c.status === 'Valid');
  const currentCycle = Number(application?.currentInternshipNumber || 1);
  const currentCertificate = validMine.find(c => Number(c.cycleNumber || 1) === currentCycle && (application?.certificateId ? c.certificateId === application.certificateId : !application?.currentInternshipNumber));
  const hasCompletedCurrent = Boolean(application?.internshipCompleted || currentCertificate);
  const hasCompletedBefore = Boolean(application?.hasCompletedInternship || application?.internshipCompleted || validMine.length);
  const completedTrack = application?.completedInternshipTrack || currentCertificate?.track || validMine[0]?.track || application?.track || 'Internship';
  const nextCycle = currentCycle + 1;
  const nextRequest = enrollmentRequests.find(request => Number(request.cycleNumber) === nextCycle);
  const requestPending = nextRequest?.status === 'Pending';

  useEffect(() => {
    if (application?.track && TRACKS.includes(application.track)) setRequestedTrack(application.track);
  }, [application?.track, application?.currentInternshipNumber]);

  return <>
    <PageTitle eyebrow="STUDENT PORTAL / OVERVIEW" title={`Welcome${application?.name ? `, ${application.name.split(' ')[0]}` : ''}`} description="Your application, internship details, and official records in one private workspace." />
    <div className="student-status-banner">
      <div><span className="eyebrow">APPLICATION STATUS</span><h2>{application?.profileCompleted ? 'Your profile is submitted' : 'Complete your applicant profile'}</h2><p>{application?.profileCompleted ? 'Your application is being reviewed. Check this dashboard for updates.' : 'Add your profile details so the DEVK team can review your application.'}</p></div>
      <StatusBadge status={application?.status || 'Profile incomplete'} />
      {!application?.profileCompleted && <button className="btn btn-primary" onClick={() => navigate('/student/settings')}>Complete profile →</button>}
    </div>

    {hasCompletedBefore && <section className="completion-panel">
      <div className="completion-panel-main">
        <div className="completion-medal" aria-hidden="true">✓</div>
        <div className="completion-copy">
          <span className="completion-kicker">DEVK VERIFIED ACHIEVEMENT</span>
          <h2>Internship completed</h2>
          <p>Your completed track is permanently recorded on your profile. Your certificate remains available in My certificates.</p>
          <div className="completion-tags"><span className="completion-track">✦ {completedTrack}</span>{(application?.completedCertificateId || application?.certificateId || currentCertificate?.certificateId) && <span className="completion-certificate">Certificate · {application?.completedCertificateId || application?.certificateId || currentCertificate?.certificateId}</span>}</div>
        </div>
        <span className="completion-ribbon">COMPLETED</span>
      </div>
      {hasCompletedCurrent ? <div className="reenroll-box">
        <div><h3>Ready for your next internship?</h3><p>Choose a program and submit a request. You will only become eligible for a new batch after the admin approves it.</p></div>
        <form className="reenroll-form" onSubmit={event => { event.preventDefault(); onApplyNextInternship?.(requestedTrack); }}>
          <label className="form-field">Next internship track<select value={requestedTrack} onChange={event => setRequestedTrack(event.target.value)} disabled={requestPending}>{TRACKS.map(track => <option key={track} value={track}>{track}</option>)}</select></label>
          <button className="btn btn-primary" disabled={requestPending || !onApplyNextInternship}>{requestPending ? 'Request pending admin approval' : nextRequest?.status === 'Rejected' ? 'Resubmit next internship request' : 'Apply for next internship →'}</button>
        </form>
        {requestPending && <p className="reenroll-status pending">Your request for {nextRequest.requestedTrack} is awaiting admin approval. Do not select or join a batch until it is approved.</p>}
        {nextRequest?.status === 'Rejected' && <p className="reenroll-status rejected">Your previous request for {nextRequest.requestedTrack} was declined. You can correct your selection and submit it again.</p>}
      </div> : <div className="reenroll-box active-cycle"><div><h3>{application?.status === 'Approved' ? `Internship cycle ${currentCycle} is active` : 'Your next internship is in progress'}</h3><p>Complete this internship and receive its certificate before requesting another program. Your previous completion badge will remain on your profile.</p></div><StatusBadge status={application?.status || 'In progress'} /></div>}
    </section>}

    <div className="stat-grid three"><article className="stat-card"><p>Application</p><strong className="student-stat-text">{application?.status || 'Draft'}</strong><small>Current review status</small></article><article className="stat-card"><p>Assigned batch</p><strong className="student-stat-text">{application?.batch && application.batch !== 'Unassigned' ? application.batch : 'Not assigned'}</strong><small>Updated after approval</small></article><article className="stat-card"><p>Certificates</p><strong>{mine.length}</strong><small>Records linked to your profile</small></article></div>
    <div className="content-grid"><section className="panel"><div className="panel-heading"><div><h2>My internship</h2><p>Your official program details</p></div><button className="text-link" onClick={() => navigate('/student/internship')}>View details →</button></div><div className="detail-grid"><div><small>TRACK</small><b>{application?.track || 'Not selected'}</b></div><div><small>BATCH</small><b>{application?.batch || 'Unassigned'}</b></div><div><small>START DATE</small><b>{application?.startDate || 'Pending'}</b></div><div><small>END DATE</small><b>{application?.endDate || 'Pending'}</b></div></div></section><section className="panel"><div className="panel-heading"><div><h2>Latest announcements</h2><p>Updates from DEVK</p></div><button className="text-link" onClick={() => navigate('/student/notifications')}>All updates →</button></div>{announcements.slice(0, 3).map(a => <div className="announcement-item" key={a.id}><b>{a.title}</b><p>{a.body}</p></div>)}{!announcements.length && <div className="empty-state compact-empty">No announcements yet.</div>}</section></div>
  </>;
}
