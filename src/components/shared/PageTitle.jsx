import React from 'react';
export default function PageTitle({ eyebrow = 'DEVK INTERNCORE', title, description, actions }) {
  return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>;
}
