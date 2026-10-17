import React, { useEffect, useState } from 'react';
export default function Avatar({ name = 'DEVK User', url = '', size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = String(url || '').trim();
  useEffect(() => setFailed(false), [imageUrl]);
  const initials = String(name || 'DEVK User').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'DU';
  return imageUrl && !failed
    ? <img className={`avatar avatar-${size}`} src={imageUrl} alt={`${name} avatar`} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
    : <span className={`avatar avatar-${size} avatar-fallback`} aria-label={`${name} avatar`}>{initials}</span>;
}
