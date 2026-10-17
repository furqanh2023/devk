import { collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

export const applicationIdFor = (uid) => `application_${uid}`;
export const watchOwnApplication = (uid, callback, onError) => onSnapshot(doc(db, 'applications', applicationIdFor(uid)), (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null), onError);
export const readOwnApplication = async (uid) => {
  const snap = await getDoc(doc(db, 'applications', applicationIdFor(uid)));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};
export const saveOwnApplication = (uid, data) => { const fields = { ...(data || {}) }; delete fields.id; return setDoc(doc(db, 'applications', applicationIdFor(uid)), { ...fields, uid, updatedAt: serverTimestamp() }, { merge: true }); };
export const saveRecord = (collectionName, id, data) => setDoc(doc(db, collectionName, id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
export const watchCollection = (name, callback, onError) => onSnapshot(collection(db, name), (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
// Students subscribe only to certificates whose owner ID matches their authenticated UID.
export const watchOwnCertificates = (uid, callback, onError) => onSnapshot(query(collection(db, 'certificates'), where('studentId', '==', uid)), (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
export const findPublicCertificate = async (code) => {
  const trimmed = String(code || '').trim();
  if (!trimmed) return null;
  const direct = await getDoc(doc(db, 'publicCertificates', trimmed));
  if (direct.exists()) return { id: direct.id, ...direct.data() };
  for (const field of ['certificateId', 'serial']) {
    const result = await getDocs(query(collection(db, 'publicCertificates'), where(field, '==', trimmed)));
    if (!result.empty) return { id: result.docs[0].id, ...result.docs[0].data() };
  }
  return null;
};

export const watchOwnNotifications = (uid, callback, onError) => onSnapshot(query(collection(db, 'notifications'), where('uid', '==', uid)), (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);


export const watchOwnEnrollmentRequests = (uid, callback, onError) => onSnapshot(
  query(collection(db, 'enrollmentRequests'), where('uid', '==', uid)),
  (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
  onError
);

// Commit the certificate, public verification record, and completion markers atomically.
export const commitCertificateCompletion = async ({ certificate, publicCertificate, studentId, student, application }) => {
  const batch = writeBatch(db);
  const certificateRef = doc(db, 'certificates', certificate.id);
  const publicRef = doc(db, 'publicCertificates', publicCertificate.certificateId);
  batch.set(certificateRef, { ...certificate, updatedAt: serverTimestamp() }, { merge: true });
  batch.set(publicRef, { ...publicCertificate, updatedAt: serverTimestamp() }, { merge: true });
  if (studentId && application) {
    batch.set(doc(db, 'applications', applicationIdFor(studentId)), { ...application, updatedAt: serverTimestamp() }, { merge: true });
  }
  if (studentId && student) {
    batch.set(doc(db, 'students', student.id || studentId), { ...student, updatedAt: serverTimestamp() }, { merge: true });
  }
  await batch.commit();
};

// Keep re-enrollment approval and its current application/student state in sync.
export const commitEnrollmentApproval = async ({ requestId, request, applicationUid, application, student }) => {
  const batch = writeBatch(db);
  batch.set(doc(db, 'enrollmentRequests', requestId), { ...request, updatedAt: serverTimestamp() }, { merge: true });
  if (applicationUid && application) {
    batch.set(doc(db, 'applications', applicationIdFor(applicationUid)), { ...application, updatedAt: serverTimestamp() }, { merge: true });
  }
  if (applicationUid && student) {
    batch.set(doc(db, 'students', student.id || applicationUid), { ...student, updatedAt: serverTimestamp() }, { merge: true });
  }
  await batch.commit();
};
