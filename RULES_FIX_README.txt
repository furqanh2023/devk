DEVK InternCore Firestore Rules Fix

Firebase Console > Firestore Database > Rules. Replace the entire editor with firestore.rules from this ZIP and click Publish.

Student profile updates are restricted by an explicit changed-fields allowlist. UID and application status/batch remain protected. All undeclared collections remain denied. Admin UID is configured in isAdmin().

Red circles in the editor gutter are usually breakpoints, not necessarily compile errors. If Publish still fails, copy the exact red error message from the editor output.
