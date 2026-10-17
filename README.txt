DEVK InternCore — Student Profile Firestore Rules Fix

This is a rules-only patch. No React components, design, or app configuration are included.

Why this targets the issue:
- Student profile saves update the owned application document and, for approved students, the owned students document.
- Previous rules required equality checks against status/batch/studentId fields even when older records may lack one of those fields.
- The updated rules authorize only the authenticated owner's existing document and only allow changes to a fixed profile-field allow-list.
- Email, UID, status, batch assignment, serial and certificate identifiers are not in the allow-list, so students cannot change them.
- Admin UID remains: RB2xlRBlJEOwcBu1ENDJBNmYMMF3.

Apply:
1. Firebase Console > Firestore Database > Rules.
2. Replace the entire rules editor with the content of firestore.rules.
3. Click Publish.
4. Refresh the site, sign in as the affected student, and save profile again.

Important:
- This patch has not been published to Firebase automatically.
- Do not make the database public or use test-mode rules.
- If permission-denied persists after publishing, inspect the exact failing document operation in the browser console; a write to a different collection would need its own narrowly scoped rule.
