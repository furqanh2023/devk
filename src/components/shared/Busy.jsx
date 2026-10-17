import React from 'react';
export default function Busy({ text = 'Loading your secure workspace…' }) {
  return (
    <main className="boot-screen" role="status" aria-live="polite">
      <img className="boot-logo" src="/logo.svg" alt="DEVK InternCore" />
      <b>{text}</b>
      <span className="loading-bar" aria-hidden="true" />
    </main>
  );
}
