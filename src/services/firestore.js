import { collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, where, serverTimestamp } from 'firebase/firestore';
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
