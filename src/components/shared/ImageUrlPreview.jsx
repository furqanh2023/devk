import React, { useEffect, useState } from 'react';

export default function ImageUrlPreview({ url = '', name = 'Profile', kind = 'avatar', label }) {
  const [failed, setFailed] = useState(false);
  const safeUrl = /^https:\/\//i.test(String(url || '').trim()) ? String(url).trim() : '';
  useEffect(() => setFailed(false), [safeUrl]);
  const initials = String(name || 'DEVK').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase() || 'D';
  if (kind === 'cover') {
    return <div className={`image-preview-cover ${safeUrl && !failed ? 'has-image' : ''}`}>
      {safeUrl && !failed ? <img src={safeUrl} alt={label || `${name} cover preview`} onError={() => setFailed(true)} /> : <div className="cover-placeholder"><span>✦</span><b>{failed ? 'Could not load cover image' : 'Cover photo preview'}</b><small>Use a public HTTPS image URL</small></div>}
      <span className="image-preview-label">{label || 'COVER PREVIEW'}</span>
    </div>;
  }
  return <div className="image-preview-avatar-wrap">
    <div className="image-preview-ring">{safeUrl && !failed ? <img src={safeUrl} alt={label || `${name} avatar preview`} onError={() => setFailed(true)} /> : <span>{initials}</span>}</div>
    <small>{failed ? 'Image could not load — check URL' : safeUrl ? 'Live image preview' : 'Avatar preview'}</small>
  </div>;
}
