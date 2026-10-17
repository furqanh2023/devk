import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function GoogleMark(){
 return <svg className="google-mark" viewBox="0 0 48 48" aria-hidden="true">
  <path fill="#4285F4" d="M47.6 24.5c0-1.6-.1-3.1-.4-4.5H24v9h13.3c-.6 3-2.3 5.5-4.8 7.2l7.8 6c4.5-4.2 7.3-10.3 7.3-17.7z"/>
  <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7.8-6c-2.2 1.5-4.9 2.3-8.2 2.3-6.3 0-11.6-4.2-13.5-9.9l-8.1 6.2C6.4 42.6 14.6 48 24 48z"/>
  <path fill="#FBBC05" d="M10.5 28.6a14.4 14.4 0 0 1 0-9.2l-8.1-6.2a24 24 0 0 0 0 21.6l8.1-6.2z"/>
  <path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.2 3.6l6.9-6.8C35.9 2.4 30.5 0 24 0 14.6 0 6.4 5.4 2.4 13.2l8.1 6.2C12.4 13.7 17.7 9.5 24 9.5z"/>
 </svg>;
}

export default function AuthPage({ mode = 'login', onSubmit, onGoogleSignIn, loading, onReset }) {
 const signup = mode === 'signup';
 const [name,setName] = useState('');
 const [email,setEmail] = useState('');
 const [password,setPassword] = useState('');
 const [error,setError] = useState('');
 const [resetSent,setResetSent] = useState(false);
 const google = async () => {
  if (!onGoogleSignIn) return;
  setError('');
  try { await onGoogleSignIn(); } catch (err) { setError(err.message || 'Google sign-in could not be completed.'); }
 };
 return <div className="auth-screen">
  <div className="auth-visual">
   <div className="auth-brand"><span className="brand-mark">D<span/></span><span><b>DEVK InternCore</b><small>INTERNSHIP OPERATIONS</small></span></div>
   <div className="auth-message"><span className="eyebrow">MANAGE · VERIFY · EMPOWER</span><h1>{signup?'Start your internship journey.':'Welcome back to your workspace.'}</h1><p>{signup?'Create your account, complete your applicant profile, and track your internship application in one secure portal.':'Sign in to continue to your own secure DEVK InternCore workspace.'}</p><div className="auth-points"><span>✓ Official application records</span><span>✓ Trusted certificate verification</span><span>✓ Private profile and internship status</span></div></div>
   <div className="auth-visual-footer">DEVK System Software House · 2026</div>
  </div>
  <div className="auth-panel"><div className="auth-card">
   <span className="eyebrow">{signup?'APPLICANT REGISTRATION':'SECURE SIGN IN'}</span>
   <h2>{signup?'Create your account':'Sign in'}</h2>
   <p>{signup?'Use an email you can access for application updates.':'Your browser will keep you signed in until you log out.'}</p>
   {error&&<div className="notice notice-error" role="alert">{error}</div>}
   {resetSent&&<div className="notice notice-success">If the account exists, a reset email has been sent.</div>}
   <button type="button" className="google-auth-button" onClick={google} disabled={loading} aria-label="Continue with Google">
    <GoogleMark/><span>{loading?'Please wait…':signup?'Sign up with Google':'Continue with Google'}</span>
   </button>
   <div className="auth-divider"><span>or continue with email</span></div>
   <form onSubmit={async(e)=>{e.preventDefault();setError('');try{await onSubmit({name,email:email.trim(),password});}catch(err){setError(err.message||'Unable to continue.');}}}>
    {signup&&<label className="form-field">Full name<input autoComplete="name" value={name} onChange={e=>setName(e.target.value)} required minLength="2" placeholder="Your full name"/></label>}
    <label className="form-field">Email address<input autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"/></label>
    <label className="form-field">Password<input autoComplete={signup?'new-password':'current-password'} type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={signup?6:1} placeholder={signup?'At least 6 characters':'Your password'}/></label>
    {!signup&&<button type="button" className="inline-link forgot-link" onClick={async()=>{if(!email.trim()){setError('Enter your email address first.');return;}try{await onReset(email.trim());setResetSent(true);}catch(err){setError(err.message||'Unable to send reset email.');}}}>Forgot password?</button>}
    <button className="btn btn-primary btn-full" disabled={loading}>{loading?'Please wait…':signup?'Create account':'Sign in'} <span>→</span></button>
   </form>
   <div className="auth-switch">{signup?'Already registered?':'New to DEVK InternCore?'} <Link to={signup?'/login':'/signup'}>{signup?'Sign in':'Create account'}</Link></div>
   <Link className="auth-public-link" to="/verify">Verify an internship certificate →</Link>
  </div></div>
 </div>;
}
