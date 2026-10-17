import React, { useState } from 'react';
export default function Dropdown({ label, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  return <div className="dropdown"><button className="dropdown-trigger" type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}>{label}<span>⌄</span></button>{open && <><button className="dropdown-dismiss" aria-label="Close menu" onClick={() => setOpen(false)} /><div className={`dropdown-menu dropdown-${align}`} onClick={() => setOpen(false)}>{children}</div></>}</div>;
}
