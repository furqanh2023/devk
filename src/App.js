import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, authPersistenceReady } from './firebase';
import { applicationIdFor, commitCertificateCompletion, commitEnrollmentApproval, findPublicCertificate, readOwnApplication, saveOwnApplication, saveRecord, watchCollection, watchOwnApplication, watchOwnCertificates, watchOwnEnrollmentRequests, watchOwnNotifications } from './services/firestore';
import AdminLayout from './components/layouts/admin/AdminLayout';
import StudentLayout from './components/layouts/student/StudentLayout';
import CreateBatchModal from './components/admin/CreateBatchModal';
import Busy from './components/shared/Busy';
import RouteGuard from './components/shared/RouteGuard';
import LandingPage from './pages/public/LandingPage';
import AuthPage from './pages/public/AuthPage';
import VerifyPage from './pages/public/VerifyPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ApplicationsPage from './pages/admin/ApplicationsPage';
import BatchesPage from './pages/admin/BatchesPage';
import BatchDetailPage from './pages/admin/BatchDetailPage';
import StudentsPage from './pages/admin/StudentsPage';
import CertificatesPage from './pages/admin/CertificatesPage';
import ReportsPage from './pages/admin/ReportsPage';
import AuditPage from './pages/admin/AuditPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import ModeratorsPage from './pages/admin/ModeratorsPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentApplicationPage from './pages/student/StudentApplicationPage';
import StudentInternshipPage from './pages/student/StudentInternshipPage';
import StudentCertificatesPage from './pages/student/StudentCertificatesPage';
import StudentSettingsPage from './pages/student/StudentSettingsPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import { askText, showMessage } from './utils/sweetAlert';
import './styles/app.css';

// Keep the designated admin recognizable in Vercel builds even when the local .env file is not deployed.
// Firestore rules still enforce admin privileges server-side.
const DEFAULT_ADMIN_UID = 'RB2xlRBlJEOwcBu1ENDJBNmYMMF3';
const ADMIN_UID = String(process.env.REACT_APP_ADMIN_UID || DEFAULT_ADMIN_UID).trim();
const demoMode = process.env.REACT_APP_DEMO_MODE === 'true';
const demoBatches = demoMode ? [{id:'demo-batch-1',code:'DEVK-INT-06',track:'Frontend Development',start:'2026-10-01',end:'2026-12-31',capacity:24,studentIds:[],status:'Active',description:'React, accessibility and production workflows.'}] : [];
const INTERNSHIP_TRACKS = ['Frontend Development', 'Backend Development', 'UI/UX Design', 'QA & Testing', 'Data Analytics', 'AI / Machine Learning'];
export default function App(){
 const [user,setUser]=useState(null); const [authReady,setAuthReady]=useState(false); const [application,setApplication]=useState(null); const [applicationReady,setApplicationReady]=useState(false);
 const [students,setStudents]=useState([]);const [applications,setApplications]=useState([]);const [enrollmentRequests,setEnrollmentRequests]=useState([]);const [studentEnrollmentRequests,setStudentEnrollmentRequests]=useState([]);const [batches,setBatches]=useState(demoBatches);const [certificates,setCertificates]=useState([]);const [audit,setAudit]=useState([]);const [announcements,setAnnouncements]=useState([]);const [notifications,setNotifications]=useState([]);const [studentNotifications,setStudentNotifications]=useState([]);
 const [busy,setBusy]=useState(false);const [notice,setNotice]=useState('');const [batchModalOpen,setBatchModalOpen]=useState(false);
 const navigate=useNavigate();const isAdmin=Boolean(user&&ADMIN_UID&&user.uid===ADMIN_UID);
 const addAudit=useCallback((action,target,type='System')=>{const entry={id:`audit_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,action,target,actor:user?.displayName||user?.email||'Unknown',time:new Date().toLocaleString(),createdAt:new Date().toISOString(),type};setAudit(old=>[entry,...old].slice(0,300));if(user&&user.uid===ADMIN_UID)saveRecord('auditLogs',entry.id,entry).catch(()=>{});},[user]);
 useEffect(()=>{let active=true;let unsubscribe;authPersistenceReady.finally(()=>{if(!active)return;unsubscribe=onAuthStateChanged(auth,async current=>{if(!active)return;setUser(current);setAuthReady(true);setApplicationReady(false);if(!current){setApplication(null);setApplicationReady(true);return;}if(current.uid===ADMIN_UID&&ADMIN_UID){setApplicationReady(true);return;}try{const own=await readOwnApplication(current.uid);if(active)setApplication(own);}catch(e){if(active)setApplication(null);}finally{if(active)setApplicationReady(true);}});});return()=>{active=false;if(unsubscribe)unsubscribe();};},[]);
 useEffect(()=>{if(!user||isAdmin)return;return watchOwnApplication(user.uid,setApplication,()=>setNotice('Could not load your application. Check Firestore Rules.'));},[user,isAdmin]);
 useEffect(()=>{if(!isAdmin)return;const cleanups=[];cleanups.push(watchCollection('applications',setApplications,()=>setNotice('Applications could not load. Check admin Firestore rules.')));cleanups.push(watchCollection('enrollmentRequests',setEnrollmentRequests,()=>setNotice('Re-enrollment requests could not load. Check admin Firestore Rules.')));cleanups.push(watchCollection('students',setStudents,()=>{}));cleanups.push(watchCollection('batches',setBatches,()=>{}));cleanups.push(watchCollection('certificates',setCertificates,()=>{}));cleanups.push(watchCollection('announcements',setAnnouncements,()=>{}));cleanups.push(watchCollection('notifications',setNotifications,()=>{}));cleanups.push(watchCollection('auditLogs',rows=>setAudit(rows.sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))),()=>{}));return()=>cleanups.forEach(fn=>fn());},[isAdmin]);
 useEffect(()=>{if(!user||isAdmin)return;const stopCertificates=watchOwnCertificates(user.uid,setCertificates,()=>setNotice('Your certificates could not load. Check that the latest Firestore Rules are published.'));const stopNotifications=watchOwnNotifications(user.uid,setStudentNotifications,()=>{});const stopEnrollmentRequests=watchOwnEnrollmentRequests(user.uid,setStudentEnrollmentRequests,()=>setNotice('Your next-internship requests could not load. Check Firestore Rules.'));return()=>{stopCertificates();stopNotifications();stopEnrollmentRequests();};},[user,isAdmin]);
 useEffect(()=>{if(!user)return;return watchCollection('announcements',setAnnouncements,()=>{});},[user]);
 useEffect(()=>{if(!notice)return;const timer=window.setTimeout(()=>setNotice(''),4500);return()=>window.clearTimeout(timer);},[notice]);
 const destinationFor=async(current)=>{if(current.uid===ADMIN_UID&&ADMIN_UID)return '/admin';try{const own=await readOwnApplication(current.uid);setApplication(own);return own?.profileCompleted?'/student':'/student/settings';}catch(e){return '/student/settings';}};
 const handleLogin=async({email,password})=>{setBusy(true);try{const cred=await signInWithEmailAndPassword(auth,email,password);const dest=await destinationFor(cred.user);navigate(dest,{replace:true});}catch(e){throw new Error(authMessage(e));}finally{setBusy(false);}};
 const handleGoogleSignIn=async()=>{
  setBusy(true);
  try{
   const provider=new GoogleAuthProvider();
   provider.setCustomParameters({prompt:'select_account'});
   const cred=await signInWithPopup(auth,provider);
   const current=cred.user;
   if(current.uid!==ADMIN_UID||!ADMIN_UID){
    let own=null;
    try{own=await readOwnApplication(current.uid);}catch(e){own=null;}
    if(!own){
     const email=current.email||'';
     const name=current.displayName||email.split('@')[0]||'Applicant';
     const payload={uid:current.uid,name,email,username:email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g,''),status:'Pending',submittedAt:new Date().toISOString(),track:'Not selected',batch:'Unassigned',profileCompleted:false,phone:'',university:'',education:'',avatar:current.photoURL||'',coverUrl:'',portfolioUrl:'',about:''};
     await saveOwnApplication(current.uid,payload);
     setApplication({id:applicationIdFor(current.uid),...payload});
     setApplicationReady(true);
     navigate('/student/settings',{replace:true});
     setNotice('Google account connected. Complete your profile to submit your application.');
     return;
    }
    if(current.photoURL&&!own.avatar){
     const updated={...own,avatar:current.photoURL};
     await saveOwnApplication(current.uid,updated);
     setApplication(updated);
    }
   }
   const dest=await destinationFor(current);
   navigate(dest,{replace:true});
  }catch(e){
   const code=e?.code||'';
   if(code==='auth/popup-closed-by-user') throw new Error('Google sign-in was cancelled. Try again when ready.');
   if(code==='auth/account-exists-with-different-credential') throw new Error('This email already uses another sign-in method. Sign in with that method first, then link Google in your account settings.');
   if(code==='auth/unauthorized-domain') throw new Error('This domain is not authorized in Firebase Authentication. Add localhost to Authentication → Settings → Authorized domains.');
   throw new Error(authMessage(e));
  }finally{setBusy(false);}
 };
 const handleSignup=async({name,email,password})=>{setBusy(true);try{const cred=await createUserWithEmailAndPassword(auth,email,password);await updateProfile(cred.user,{displayName:name});try{await sendEmailVerification(cred.user);}catch(e){}const payload={uid:cred.user.uid,name,email,username:email.split('@')[0].toLowerCase().replace(/[^a-z0-9_.]/g,''),status:'Pending',submittedAt:new Date().toISOString(),track:'Not selected',batch:'Unassigned',profileCompleted:false,phone:'',university:'',education:'',avatar:'',portfolioUrl:'',about:''};await saveOwnApplication(cred.user.uid,payload);setApplication({id:applicationIdFor(cred.user.uid),...payload});setApplicationReady(true);navigate('/student/settings',{replace:true});setNotice('Account created. Complete your profile to submit your application.');}catch(e){throw new Error(authMessage(e));}finally{setBusy(false);}};
 const handleLogout=async()=>{await signOut(auth);setApplication(null);setApplicationReady(true);navigate('/login',{replace:true});};
 const handleProfileSave=async(data)=>{if(!user)return;setBusy(true);try{const current=application||{};const payload={...current,...data,uid:user.uid,email:user.email,status:current.status||'Pending',submittedAt:current.submittedAt||new Date().toISOString(),batch:current.batch||'Unassigned',profileCompleted:true};await updateProfile(user,{displayName:payload.name||user.displayName,photoURL:payload.avatar||null});await saveOwnApplication(user.uid,payload);if(!isAdmin&&current.status==='Approved'){await saveRecord('students',user.uid,{...payload,id:user.uid,studentId:user.uid,uid:user.uid});}setApplication({id:applicationIdFor(user.uid),...payload});if(isAdmin){setNotice('Admin profile preferences saved.');}else{setNotice('Profile saved. Your application is ready for review.');if(!current.profileCompleted)navigate('/student',{replace:true});}addAudit('Profile updated',user.email,'Profile');}catch(e){setNotice(`Could not save changes (${e.code||'error'}). Confirm that the latest Firestore Rules are published.`);}finally{setBusy(false);}};
 const resetPassword=async(email)=>{await sendPasswordResetEmail(auth,email);setNotice('If the account exists, a password reset email has been sent.');};
 const decideApplication=async(app,status)=>{let reason='';if(status==='Rejected'){const result=await askText({title:'Reject application',text:'Add a reason that will be recorded with this decision.',placeholder:'Reason for rejection',requiredMessage:'A rejection reason is required.',confirmButtonText:'Reject application'});if(!result.isConfirmed)return;reason=String(result.value||'').trim();}const updated={...app,status,reviewReason:reason||'',reviewedAt:new Date().toISOString(),reviewedBy:user.uid};try{await saveRecord('applications',app.id,updated);if(status==='Approved'){const studentId=app.uid||app.id;await saveRecord('students',studentId,{...updated,id:studentId,studentId,uid:app.uid||'',batch:app.batch||'Unassigned'});}else if(status==='Rejected'){const existingStudent=students.find(s=>s.uid===app.uid||s.id===app.uid);if(existingStudent)await saveRecord('students',existingStudent.id,{...existingStudent,status:'Rejected'});}addAudit(`Application ${status.toLowerCase()}`,app.email||app.name,'Application');if(app.uid){await saveRecord('notifications',`notice_${app.uid}_${Date.now()}`,{uid:app.uid,title:`Application ${status.toLowerCase()}`,body:status==='Approved'?'Your DEVK internship application has been approved. Check your student dashboard for batch details.':`Your application was not approved. Review the decision note: ${reason||'Contact DEVK for details.'}`,type:'application',createdAt:new Date().toISOString(),read:false});}setNotice(`Application ${status.toLowerCase()}.`);}catch(e){setNotice(`Decision was not saved (${e.code||'error'}). Check Firestore Rules.`);}};
 const createBatch=async(data)=>{if(batches.some(b=>b.code?.toLowerCase()===data.code.toLowerCase())){setNotice('That batch code already exists. Choose a unique code.');return;}const id=`batch_${Date.now()}`;const batch={id,...data,studentIds:[],status:'Active'};try{await saveRecord('batches',id,batch);addAudit('Batch created',batch.code,'Batch');setBatchModalOpen(false);setNotice('Batch created. Open it to inspect or assign students.');}catch(e){setNotice(`Could not create batch (${e.code||'error'}). Check Firestore Rules.`);throw e;}};
 const assignStudent=async(batch,student)=>{if((batch.studentIds||[]).length>=(batch.capacity||0)){setNotice('This batch is at capacity.');return;}if(student.batch&&student.batch!=='Unassigned'&&student.batch!==batch.code){setNotice('This student is already assigned to another batch.');return;}try{await saveRecord('batches',batch.id,{...batch,studentIds:[...new Set([...(batch.studentIds||[]),student.id]) ]});await saveRecord('students',student.id,{...student,batch:batch.code});if(student.uid)await saveRecord('applications',applicationIdFor(student.uid),{batch:batch.code});addAudit('Student assigned to batch',student.name||student.email,'Batch');if(student.uid)await saveRecord('notifications',`notice_${student.uid}_${Date.now()}`,{uid:student.uid,title:'Batch assigned',body:`You have been assigned to ${batch.code}. Open My internship for details.`,type:'batch',createdAt:new Date().toISOString(),read:false});setNotice('Student assigned to batch.');}catch(e){setNotice(`Assignment failed (${e.code||'error'}). Check Firestore Rules.`);}};
 const unassignStudent=async(batch,student)=>{try{await saveRecord('batches',batch.id,{...batch,studentIds:(batch.studentIds||[]).filter(id=>id!==student.id)});await saveRecord('students',student.id,{...student,batch:'Unassigned'});if(student.uid)await saveRecord('applications',applicationIdFor(student.uid),{batch:'Unassigned'});addAudit('Student removed from batch',student.name||student.email,'Batch');setNotice('Student removed from batch.');}catch(e){setNotice(`Could not update roster (${e.code||'error'}).`);}};
 const toggleStudent=async(student)=>{const status=student.status==='Suspended'?'Approved':'Suspended';try{await saveRecord('students',student.id,{...student,status});if(student.uid)await saveRecord('applications',applicationIdFor(student.uid),{status});addAudit(`Student ${status.toLowerCase()}`,student.email||student.name,'Student');setNotice(`Student ${status.toLowerCase()}.`);}catch(e){setNotice(`Could not update student status (${e.code||'error'}).`);}};
 const revokeCertificate=async(c)=>{const result=await askText({title:'Revoke certificate',text:`Enter the reason for revoking ${c.certificateId}.`,placeholder:'Reason for revocation',requiredMessage:'A revocation reason is required.',confirmButtonText:'Revoke certificate'});if(!result.isConfirmed)return;const reason=String(result.value||'').trim();const updated={...c,status:'Revoked',reason:reason.trim()};const publicRecord={certificateId:c.certificateId,serial:c.serial,studentName:c.studentName,track:c.track,batch:c.batch,issueDate:c.issueDate,status:'Revoked',reason:reason.trim()};try{await saveRecord('certificates',c.id,updated);await saveRecord('publicCertificates',c.certificateId,publicRecord);addAudit('Certificate revoked',c.certificateId,'Certificate');setNotice('Certificate revoked.');}catch(e){setNotice(`Could not revoke certificate (${e.code||'error'}).`);}};
 const printCertificate=(c)=>{const verifyUrl=`${window.location.origin}/verify?code=${encodeURIComponent(c.certificateId)}`;const qr=`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;const escape=(v)=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));const win=window.open('','_blank','width=900,height=700');if(!win){setNotice('Allow pop-ups to print/save the certificate as PDF.');return;}win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escape(c.certificateId)}</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#1a3153}.paper{border:8px double #326ce5;min-height:480px;padding:36px;text-align:center}.brand{font-weight:800;letter-spacing:2px;color:#326ce5}.name{font-size:34px;margin:24px;color:#172b4d}.track{font-size:20px;color:#326ce5}.foot{display:flex;align-items:center;justify-content:space-between;text-align:left;margin-top:28px}.foot img{width:130px;height:130px}.muted{color:#8290a7}@media print{body{padding:0}.paper{min-height:90vh}}</style></head><body><main class="paper"><div class="brand">DEVK SYSTEM SOFTWARE HOUSE</div><p class="muted">OFFICIAL CERTIFICATE OF INTERNSHIP</p><h1>Certificate of Completion</h1><p>This certificate is presented to</p><div class="name">${escape(c.studentName)}</div><p>for successful completion of</p><div class="track">${escape(c.track)}</div><p>Batch: <b>${escape(c.batch)}</b></p><p>Internship cycle: <b>${escape(c.cycleNumber||1)}</b></p><p class="muted">Issued on ${escape(c.issueDate)}</p><div class="foot"><div><b>${escape(c.certificateId)}</b><p>Serial: ${escape(c.serial)}</p><p>Status: ${escape(c.status)}</p></div><img src="${qr}" alt="Public verification QR"></div></main><script>window.onload=()=>window.print()</script></body></html>`);win.document.close();};
 const issueCertificate=async()=>{
    const currentApplicationFor = (student) => applications.find(a => a.uid === (student.uid || student.id)) || {};
    const eligible=students.filter(student=>{
      const uid=student.uid||student.id;
      const app=currentApplicationFor(student);
      const cycle=Number(app.currentInternshipNumber||student.currentInternshipNumber||1);
      const alreadyIssuedForCycle=certificates.some(c=>c&&(c.studentUid===uid||c.studentId===uid)&&c.status==='Valid'&&Number(c.cycleNumber||1)===cycle);
      return student.status==='Approved'&&!app.internshipCompleted&&!student.internshipCompleted&&!alreadyIssuedForCycle;
    });
    if(!eligible.length){setNotice('No approved students are eligible for a certificate right now. A new certificate becomes available after the next internship request is approved.');await showMessage('No eligible students','Only students who are currently approved for an active internship and have not completed that cycle can receive a certificate.','info');return;}
    const studentOptions=Object.fromEntries(eligible.map(student=>{const app=currentApplicationFor(student);return [student.id,`${student.name||student.email} — ${app.track||student.track||'Track not selected'} — ${student.id}`];}));
    const selected=await askText({title:'Choose a student',text:'Select the approved student who will receive this certificate. Their selected internship track is shown in the list.',input:'select',inputOptions:studentOptions,defaultValue:eligible[0].id,required:true,confirmButtonText:'Continue'});
    if(!selected.isConfirmed)return;
    const student=eligible.find(s=>s.id===selected.value);
    if(!student)return;
    const uid=student.uid||student.id;
    const currentApp=currentApplicationFor(student);
    const preferredTrack=INTERNSHIP_TRACKS.includes(currentApp.track)?currentApp.track:(INTERNSHIP_TRACKS.includes(student.track)?student.track:INTERNSHIP_TRACKS[0]);
    const trackOptions=Object.fromEntries(INTERNSHIP_TRACKS.map(track=>[track,track]));
    const trackResult=await askText({title:'Confirm certificate track',text:`The student's selected track is ${currentApp.track||student.track||'not set'}. Confirm the track that will appear on the official certificate.`,input:'select',inputOptions:trackOptions,defaultValue:preferredTrack,required:true,confirmButtonText:'Continue'});
    if(!trackResult.isConfirmed)return;
    const track=String(trackResult.value||'').trim();
    if(!INTERNSHIP_TRACKS.includes(track)){setNotice('Choose a valid internship track.');return;}
    const year=new Date().getFullYear();
    const certificateIdResult=await askText({title:'Certificate ID',text:'Enter the official certificate identifier.',defaultValue:`DEVK-CERT-${year}-${String(Date.now()).slice(-4)}`,placeholder:'DEVK-CERT-YYYY-XXXX',requiredMessage:'Certificate ID is required.',confirmButtonText:'Continue'});
    if(!certificateIdResult.isConfirmed)return;
    const certificateId=String(certificateIdResult.value||'').trim();
    const serialResult=await askText({title:'Internship serial',text:'Enter the official internship serial number.',defaultValue:`DEVK-${year}-${String(Date.now()).slice(-4)}`,placeholder:'DEVK-YYYY-XXXX',requiredMessage:'Internship serial is required.',confirmButtonText:'Issue certificate'});
    if(!serialResult.isConfirmed)return;
    const serial=String(serialResult.value||'').trim();
    if(certificates.some(c=>c&&(c.certificateId===certificateId||c.serial===serial))){await showMessage('Duplicate certificate details','Certificate ID and serial must be unique.','warning');return;}
    const issueDate=new Date().toISOString().slice(0,10);
    const cycleNumber=Number(currentApp.currentInternshipNumber||student.currentInternshipNumber||1);
    const completedAt=new Date().toISOString();
    const batchCode=currentApp.batch&&currentApp.batch!=='Unassigned'?currentApp.batch:(student.batch||'Unassigned');
    const historyItem={cycleNumber,track,batch:batchCode,certificateId,serial,issueDate,completedAt};
    const previousHistory=Array.isArray(currentApp.internshipHistory)?currentApp.internshipHistory:(Array.isArray(student.internshipHistory)?student.internshipHistory:[]);
    const internshipHistory=[...previousHistory.filter(item=>Number(item.cycleNumber)!==cycleNumber),historyItem];
    const record={id:certificateId,certificateId,serial,studentId:uid,studentUid:uid,studentName:currentApp.name||student.name||student.email,track,batch:batchCode,issueDate,status:'Valid',cycleNumber,certificateType:'Internship Completion',completedAt};
    const publicRecord={certificateId:record.certificateId,serial:record.serial,studentName:record.studentName,track:record.track,batch:record.batch,issueDate,status:'Valid',cycleNumber,certificateType:'Internship Completion'};
    const updatedApplication={...currentApp,uid,status:'Completed',track,batch:batchCode,serial,certificateId,currentInternshipNumber:cycleNumber,internshipCompleted:true,hasCompletedInternship:true,completedInternshipTrack:track,completedCertificateId:certificateId,completedAt,internshipHistory};
    const updatedStudent={...student,uid,status:'Completed',track,batch:batchCode,serial,certificateId,currentInternshipNumber:cycleNumber,internshipCompleted:true,hasCompletedInternship:true,completedInternshipTrack:track,completedCertificateId:certificateId,completedAt,internshipHistory};
    try{
      await commitCertificateCompletion({certificate:record,publicCertificate:publicRecord,studentId:uid,student:updatedStudent,application:updatedApplication});
      addAudit('Certificate issued and internship completed',record.certificateId,'Certificate');
      await saveRecord('notifications',`notice_${uid}_${Date.now()}`,{uid,title:'Internship completed',body:`Your ${track} internship is marked complete. Certificate ${record.certificateId} is available. You can request the next internship program from your dashboard.`,type:'certificate',createdAt:new Date().toISOString(),read:false});
      setNotice(`Certificate issued for ${track}. Internship cycle ${cycleNumber} marked complete.`);
      await showMessage('Certificate issued','The certificate has been saved, published for verification, and the internship completion badge is now available. A new internship requires an admin-approved re-enrollment request.','success');
    }catch(e){setNotice(`Could not issue certificate (${e.code||'error'}).`);await showMessage('Could not issue certificate',e.message||e.code||'Please try again.','error');}
  };
  const submitNextEnrollment=async(requestedTrack)=>{
    if(!user||isAdmin||!application)return;
    const ownCertificates=certificates.filter(c=>(c.studentUid===user.uid||c.studentId===user.uid)&&c.status==='Valid');
    const currentCycle=Number(application.currentInternshipNumber||1);
    const completedCertificate=ownCertificates.find(c=>Number(c.cycleNumber||1)===currentCycle&&(application.certificateId===c.certificateId||application.internshipCompleted||!application.currentInternshipNumber));
    const canUseLegacyCertificate=Boolean(application.certificateId&&completedCertificate);
    if(!(application.internshipCompleted===true||canUseLegacyCertificate)){
      setNotice('You can request another internship only after your current internship has been completed and certified.');
      return;
    }
    const nextCycle=currentCycle+1;
    const requestId=`enrollment_${user.uid}_${nextCycle}`;
    const existing=studentEnrollmentRequests.find(item=>item.id===requestId);
    if(existing?.status==='Pending'){setNotice('Your next-internship request is already waiting for admin approval.');return;}
    const completedTrack=application.completedInternshipTrack||completedCertificate?.track||application.track||'Internship';
    const completedCertificateId=application.completedCertificateId||completedCertificate?.certificateId||application.certificateId||'';
    const request={uid:user.uid,name:application.name||user.displayName||user.email,email:user.email||application.email||'',status:'Pending',requestedTrack,requestedAt:new Date().toISOString(),cycleNumber:nextCycle,hasCompletedInternship:true,completedTrack,completedCertificateId,completedAt:application.completedAt||completedCertificate?.completedAt||completedCertificate?.issueDate||'',previousBatch:application.batch||completedCertificate?.batch||'Unassigned'};
    try{
      await saveRecord('enrollmentRequests',requestId,request);
      setNotice('Next internship request sent. You will become eligible for a new batch only after admin approval.');
    }catch(e){setNotice(`Could not submit the next internship request (${e.code||'error'}). Make sure the latest Firestore Rules are published.`);}
  };
  const decideEnrollmentRequest=async(request,status)=>{
    const reviewed={...request,status,reviewedAt:new Date().toISOString(),reviewedBy:user.uid};
    try{
      if(status==='Approved'){
        const uid=request.uid;
        const currentApp=applications.find(a=>a.uid===uid)||{};
        const currentStudent=students.find(s=>(s.uid||s.id)===uid)||{id:uid,uid,name:request.name,email:request.email};
        const legacyCertificate=certificates.find(c=>(c.studentUid===uid||c.studentId===uid)&&c.status==='Valid'&&(c.certificateId===currentApp.certificateId||Number(c.cycleNumber||1)===Number(currentApp.currentInternshipNumber||1)));
        if(!(currentApp.internshipCompleted===true||(currentApp.certificateId&&legacyCertificate))){
          await showMessage('Completion required','This student does not have a verified completion record for the current internship. The request cannot be approved.','warning');
          return;
        }
        const nextApplication={...currentApp,uid,status:'Approved',track:request.requestedTrack,batch:'Unassigned',currentInternshipNumber:Number(request.cycleNumber),internshipCompleted:false,hasCompletedInternship:true,certificateId:'',serial:'',nextEnrollmentApprovedAt:new Date().toISOString(),nextEnrollmentRequestId:request.id};
        const nextStudent={...currentStudent,uid,status:'Approved',track:request.requestedTrack,batch:'Unassigned',currentInternshipNumber:Number(request.cycleNumber),internshipCompleted:false,hasCompletedInternship:true,certificateId:'',serial:'',nextEnrollmentApprovedAt:new Date().toISOString(),nextEnrollmentRequestId:request.id};
        await commitEnrollmentApproval({requestId:request.id,request:reviewed,applicationUid:uid,application:nextApplication,student:nextStudent});
        await saveRecord('notifications',`notice_${uid}_${Date.now()}`,{uid,title:'Next internship approved',body:`Your request for ${request.requestedTrack} has been approved. You are now eligible for assignment to the next batch.`,type:'enrollment',createdAt:new Date().toISOString(),read:false});
        addAudit('Next internship request approved',`${request.name} · ${request.requestedTrack}`,'Enrollment');
        setNotice(`Next internship approved for ${request.name}. The student is eligible for a new batch.`);
      }else{
        await saveRecord('enrollmentRequests',request.id,reviewed);
        await saveRecord('notifications',`notice_${request.uid}_${Date.now()}`,{uid:request.uid,title:'Next internship request declined',body:`Your request for ${request.requestedTrack} was declined. Your completed internship and certificate remain on your profile.`,type:'enrollment',createdAt:new Date().toISOString(),read:false});
        addAudit('Next internship request rejected',`${request.name} · ${request.requestedTrack}`,'Enrollment');
        setNotice(`Next internship request rejected for ${request.name}.`);
      }
    }catch(e){setNotice(`Could not review next internship request (${e.code||'error'}). Check the latest Firestore Rules.`);}
  };
  const publishAnnouncement=async(data)=>{const id=`announcement_${Date.now()}`;const announcement={id,...data,createdAt:new Date().toLocaleString(),createdBy:user.uid};try{await saveRecord('announcements',id,announcement);addAudit('Announcement published',data.title,'Announcement');setNotice('Announcement published.');}catch(e){setNotice(`Could not publish announcement (${e.code||'error'}).`);}};
 const verify=async(code)=>{try{const c=await findPublicCertificate(code);if(!c)return {kind:'missing',message:'No matching certificate was found in the public verification records.'};if(c.status==='Revoked')return {kind:'revoked',message:'This certificate has been revoked.',certificate:c};if(c.status==='Valid')return {kind:'valid',message:'This certificate matches an official DEVK record.',certificate:c};return {kind:'missing',message:'A record was found but its status is not recognized. Contact DEVK.'};}catch(e){return {kind:'error',message:'The public verification service is unavailable. Please try again later.'};}};
 const exportReport=()=>{const rows=[['Metric','Value'],['Applications',applications.length],['Pending applications',applications.filter(a=>a.status==='Pending').length],['Approved students',students.filter(s=>s.status==='Approved').length],['Active batches',batches.filter(b=>b.status==='Active').length],['Certificates',certificates.length]];const csv=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='devk-interncore-report.csv';a.click();URL.revokeObjectURL(url);};
 const publicVerify=<VerifyPage onVerify={verify}/>;
 const loginRedirect=useMemo(()=>user? (user.uid===ADMIN_UID&&ADMIN_UID?'/admin':!applicationReady?'/student':application?.profileCompleted?'/student':'/student/settings') : null,[user,application,applicationReady]);
 if(!authReady)return <Busy/>;
 return <><Routes>
  <Route path="/" element={user?<Navigate to={loginRedirect||'/student'} replace/>:<LandingPage/>}/>
  <Route path="/login" element={user?<Navigate to={loginRedirect||'/student'} replace/>:<AuthPage mode="login" onSubmit={handleLogin} onGoogleSignIn={handleGoogleSignIn} loading={busy} onReset={resetPassword}/>}/>
  <Route path="/signup" element={user?<Navigate to={loginRedirect||'/student'} replace/>:<AuthPage mode="signup" onSubmit={handleSignup} onGoogleSignIn={handleGoogleSignIn} loading={busy}/>}/>
  <Route path="/verify" element={publicVerify}/>
  <Route path="/admin" element={<RouteGuard user={user} authReady={authReady} role="admin" adminUid={ADMIN_UID} application={application} applicationReady={applicationReady}><AdminLayout user={user} onLogout={handleLogout} applicationCount={applications.filter(a=>a.status==='Pending').length+enrollmentRequests.filter(request=>request.status==='Pending').length}/></RouteGuard>}>
   <Route index element={<AdminDashboard applications={applications} students={students} batches={batches} certificates={certificates} audit={audit}/>}/>
   <Route path="applications" element={<ApplicationsPage applications={applications} enrollmentRequests={enrollmentRequests} onDecision={decideApplication} onEnrollmentDecision={decideEnrollmentRequest}/>}/>
   <Route path="students" element={<StudentsPage students={students} onEdit={async s=>{const result=await askText({title:'Edit student display name',text:'Update the name shown in the student directory.',defaultValue:s.name||'',placeholder:'Student display name',requiredMessage:'A display name is required.',confirmButtonText:'Save name'});if(result.isConfirmed){const name=String(result.value||'').trim();try{await saveRecord('students',s.id,{...s,name});await showMessage('Student updated','The display name was saved.','success');}catch(e){await showMessage('Could not update student',e.message||e.code||'Please try again.','error');}}}} onToggle={toggleStudent}/>}/>
   <Route path="batches" element={<BatchesPage batches={batches} onCreate={()=>setBatchModalOpen(true)}/>}/>
   <Route path="batches/:batchId" element={<BatchDetailPage batches={batches} students={students} onAssign={assignStudent} onUnassign={unassignStudent}/>}/>
   <Route path="certificates" element={<CertificatesPage certificates={certificates} onRevoke={revokeCertificate} onIssue={issueCertificate} onPrint={printCertificate}/>}/>
   <Route path="moderators" element={<ModeratorsPage/>}/>
   <Route path="reports" element={<ReportsPage students={students} applications={applications} batches={batches} certificates={certificates} onExport={exportReport}/>}/>
   <Route path="audit" element={<AuditPage audit={audit}/>}/>
   <Route path="notifications" element={<NotificationsPage notifications={notifications}/>}/>
   <Route path="announcements" element={<AnnouncementsPage announcements={announcements} onPublish={publishAnnouncement}/>}/>
   <Route path="settings" element={<AdminSettingsPage user={user} onSave={async(data)=>{try{const nextName=String(data.displayName||user.displayName||'Administrator').trim();const nextAvatar=String(data.avatar||'').trim();const nextCover=String(data.coverUrl||'').trim();await updateProfile(user,{displayName:nextName,photoURL:nextAvatar||null});const prefs={emailAlerts:data.emailAlerts!==false,avatar:nextAvatar,coverUrl:nextCover};localStorage.setItem('devk.admin.preferences',JSON.stringify(prefs));await saveRecord('settings',user.uid,{displayName:nextName,emailAlerts:prefs.emailAlerts,avatar:nextAvatar,coverUrl:nextCover,updatedAt:new Date().toISOString()});addAudit('Admin preferences updated',user.email,'Settings');setNotice('Admin profile and preferences saved.');}catch(e){setNotice(`Could not save profile preferences (${e.code||e.message||'error'}). Check Firestore Rules and network.`);}}}/>}/>
  </Route>
  <Route path="/student" element={<RouteGuard user={user} authReady={authReady} role="student" adminUid={ADMIN_UID} application={application} applicationReady={applicationReady}><StudentLayout user={user} application={application} onLogout={handleLogout}/></RouteGuard>}>
   <Route index element={<StudentDashboard user={user} application={application} certificates={certificates} announcements={announcements} enrollmentRequests={studentEnrollmentRequests} onApplyNextInternship={submitNextEnrollment}/>}/>
   <Route path="application" element={<StudentApplicationPage application={application}/>}/>
   <Route path="internship" element={<StudentInternshipPage application={application}/>}/>
   <Route path="certificates" element={<StudentCertificatesPage certificates={certificates} user={user} application={application}/>}/>
   <Route path="announcements" element={<StudentNotificationsPage announcements={announcements} notifications={studentNotifications}/>}/>
   <Route path="notifications" element={<StudentNotificationsPage announcements={announcements} notifications={studentNotifications}/>}/>
   <Route path="settings" element={<StudentSettingsPage user={user} application={application} hasCompletedInternship={Boolean(application?.hasCompletedInternship||application?.internshipCompleted||certificates.some(c=>c&&user?.uid&&(c.studentUid===user.uid||c.studentId===user.uid)&&c.status==='Valid'))} completedInternshipTrack={application?.completedInternshipTrack||certificates.find(c=>c&&user?.uid&&(c.studentUid===user.uid||c.studentId===user.uid)&&c.status==='Valid')?.track||application?.track} onSave={handleProfileSave} onPasswordReset={resetPassword}/>}/>
  </Route>
  <Route path="*" element={<Navigate to={user ? (isAdmin ? '/admin' : '/student') : '/'} replace/>}/>
 </Routes>{batchModalOpen&&isAdmin&&<CreateBatchModal onClose={()=>setBatchModalOpen(false)} onSubmit={createBatch}/>}{notice&&<div className="toast" role="status"><span>✓</span>{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss">×</button></div>}</>;
}
function authMessage(error){const messages={'auth/email-already-in-use':'This email already has an account.','auth/invalid-email':'Enter a valid email address.','auth/invalid-credential':'Email or password is incorrect.','auth/weak-password':'Use at least 6 characters for your password.','auth/too-many-requests':'Too many attempts. Try again later.','auth/network-request-failed':'Network connection failed. Check your connection.'};return messages[error?.code]||`Unable to complete this action (${error?.code||'unknown error'}).`;}
