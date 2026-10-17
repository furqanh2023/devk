import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/ui/StatusBadge';

export default function VerifyPage({ onVerify }) {
  const [code, setCode] = useState(new URLSearchParams(window.location.search).get('code') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    const value = code.trim();
    if (!value || loading) return;
    setLoading(true);
    setResult(null);
    try { setResult(await onVerify(value)); }
    finally { setLoading(false); }
  };
  const isValid = result?.kind === 'valid';
  const isRevoked = result?.kind === 'revoked';
  return <div className="verify-page-redesign">
    <header className="verify-nav">
      <Link className="brand verify-brand" to="/"><span className="brand-mark">D<span /></span><span><b>DEVK <em>InternCore</em></b><small>TRUSTED RECORDS</small></span></Link>
      <nav><Link to="/" className="verify-nav-link">Home</Link><Link to="/login" className="btn btn-secondary">Sign in <span aria-hidden="true">↗</span></Link></nav>
    </header>
    <main className="verify-shell">
      <section className="verify-intro">
        <div className="verify-overline"><span className="online-dot" /> OFFICIAL DEVK VERIFICATION PORTAL</div>
        <h1>Proof that stands up<br/><span>to verification.</span></h1>
        <p>Check an internship certificate or serial against DEVK's official published records. Only certificate-safe information is displayed.</p>
        <div className="verify-trust-points"><span><i>✓</i> Official record lookup</span><span><i>✓</i> Privacy-conscious results</span><span><i>✓</i> No account required</span></div>
        <div className="verify-illustration" aria-hidden="true"><div className="verify-orbit verify-orbit-one"/><div className="verify-orbit verify-orbit-two"/><div className="verify-document"><div className="verify-doc-brand"><span>D</span><b>DEVK <small>InternCore</small></b></div><div className="verify-doc-seal">✓</div><small className="verify-doc-caption">INTERNSHIP CREDENTIAL</small><strong>Certificate record</strong><div className="verify-doc-line"/><div className="verify-doc-line short"/><div className="verify-doc-foot"><span>OFFICIAL RECORD</span><span>VERIFIED</span></div></div><div className="verify-floating-check">✓ <span>Secure lookup</span></div></div>
      </section>
      <section className="verify-work-area">
        <div className="verify-search-card">
          <div className="verify-card-heading"><span className="verify-search-icon">⌕</span><div><h2>Verify a certificate</h2><p>Enter the certificate ID or internship serial below.</p></div></div>
          <form onSubmit={submit} className="verify-form-redesign">
            <label htmlFor="certificate-code">Certificate ID or internship serial</label>
            <div className="verify-input-wrap"><span aria-hidden="true">⌕</span><input id="certificate-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. DEVK-CERT-2026-0142" autoComplete="off" required /></div>
            <button className="btn btn-primary btn-full verify-submit" disabled={loading || !code.trim()}>{loading ? <><span className="verify-spinner"/> Checking official records…</> : <>Verify record <span aria-hidden="true">→</span></>}</button>
            <small className="verify-form-note"><span>▣</span> Your search is checked against published certificate records.</small>
          </form>
        </div>
        {result && <section className={`verify-result-redesign result-${result.kind}`} aria-live="polite">
          <div className="verify-result-status-icon">{isValid ? '✓' : isRevoked ? '!' : result.kind === 'error' ? '↻' : '×'}</div>
          <div className="verify-result-content">
            <div className="verify-result-head"><div><small className="verify-overline">VERIFICATION RESULT</small><h2>{isValid ? 'Official record verified' : isRevoked ? 'Certificate has been revoked' : result.kind === 'error' ? 'Verification unavailable' : 'No matching record'}</h2></div>{result.certificate && <StatusBadge status={result.certificate.status}/>}</div>
            <p>{result.message}</p>
            {result.certificate && <dl className="verify-data-grid"><div><dt>Recipient</dt><dd>{result.certificate.studentName || '—'}</dd></div><div><dt>Certificate ID</dt><dd>{result.certificate.certificateId || '—'}</dd></div><div><dt>Internship serial</dt><dd>{result.certificate.serial || '—'}</dd></div><div><dt>Track</dt><dd>{result.certificate.track || '—'}</dd></div><div><dt>Batch</dt><dd>{result.certificate.batch || '—'}</dd></div><div><dt>Internship cycle</dt><dd>{result.certificate.cycleNumber || 1}</dd></div><div><dt>Certificate type</dt><dd>{result.certificate.certificateType || 'Internship Completion'}</dd></div><div><dt>Issue date</dt><dd>{result.certificate.issueDate || '—'}</dd></div></dl>}
          </div>
        </section>}
        {!result && <div className="verify-help-card"><span>i</span><div><b>Where can I find my certificate ID?</b><p>Look on the certificate document or use the internship serial provided by DEVK.</p></div></div>}
        <p className="verify-privacy-redesign"><span>♢</span> This public check never displays private contact information, account IDs, or profile details.</p>
      </section>
    </main>
    <footer className="verify-footer"><span>© 2026 DEVK System Software House</span><span><i className="online-dot"/> Trusted records · Privacy-first verification</span></footer>
  </div>;
}
