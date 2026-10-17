import React from 'react';
export default function StatusBadge({ status = 'Pending' }) {
  const key = String(status).toLowerCase().replace(/[^a-z]/g, '');
  return <span className={`status-badge status-${key}`}><i />{status}</span>;
}
