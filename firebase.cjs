const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');
const fs = require('fs');

// =============================================================================
// FIREBASE ADMIN CREDENTIAL LOADING
// =============================================================================
// Two supported ways to provide the service account — see .env.example for
// the full instructions on setting each one up:
//
//   1. FIREBASE_SERVICE_ACCOUNT_BASE64 (production / Vercel)
//      The service account JSON, base64-encoded, set as a Vercel project
//      env var. This is the ONLY way production gets the credential —
//      firebase-service-account.json is gitignored, so it never reaches
//      Vercel through a normal Git deployment no matter how the repo is
//      pushed.
//
//   2. firebase-service-account.json (local dev)
//      The raw file sitting in the repo root, gitignored, present only on
//      a developer's own machine.
//
// IMPORTANT — this is NOT a "fallback" in the sense this project avoids
// everywhere else: both paths are deliberate, equally valid ways to supply
// the SAME required credential, not one silently covering for the other
// being broken. If NEITHER is present, this throws immediately with a
// specific, actionable error — same fail-fast behavior as every other
// Firebase-dependent piece of this backend. It does not continue with a
// missing or partial credential.
// =============================================================================
function loadServiceAccount() {
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (base64) {
    try {
      return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    } catch (err) {
      // Deliberately NOT falling through to the local file here. If
      // FIREBASE_SERVICE_ACCOUNT_BASE64 is set but fails to decode, that's
      // a configuration mistake (wrong value, truncated copy-paste, not
      // actually base64) that needs fixing at the source — silently trying
      // a different credential instead would hide exactly which one is
      // broken.
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_BASE64 is set but could not be decoded as base64-encoded JSON. ' +
        'Re-generate it with the command in .env.example and reset it in Vercel\'s ' +
        'Environment Variables (Settings > Environment Variables).'
      );
    }
  }

  // ---------------------------------------------------------------------
  // Fall back to the local file — this only ever runs when the env var
  // above isn't set at all, i.e. local development.
  // ---------------------------------------------------------------------
  const localPath = path.join(__dirname, 'firebase-service-account.json');
  if (fs.existsSync(localPath)) {
    return require(localPath);
  }

  throw new Error(
    'No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT_BASE64 in your ' +
    'environment (see .env.example for the exact steps), or place ' +
    'firebase-service-account.json in the repo root for local development.'
  );
}

const serviceAccount = loadServiceAccount();

// =============================================================================
// FIREBASE APP INITIALIZATION
// =============================================================================
// v14 of firebase-admin removed the old flat namespace (admin.apps,
// admin.auth(), admin.credential.cert()) from plain require('firebase-admin')
// — it now only re-exports app-management functions. Auth needs its own
// modular import from 'firebase-admin/auth'. Confirmed by inspecting
// Object.keys(require('firebase-admin')) directly against the installed
// v14.1.0, not assumed from documentation.
// =============================================================================
let app;
if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id || 'rni-database',
  });
} else {
  app = getApps()[0];
}

const auth = getAuth(app);

module.exports = { auth };