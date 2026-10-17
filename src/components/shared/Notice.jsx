import React from 'react';
export default function Notice({ children, tone = 'info' }) { return <div className={`notice notice-${tone}`} role="status">{children}</div>; }
