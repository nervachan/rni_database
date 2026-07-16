const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

const serviceAccount = require(path.join(__dirname, 'firebase-service-account.json'));

// v14 of firebase-admin removed the old flat namespace (admin.apps,
// admin.auth(), admin.credential.cert()) from plain require('firebase-admin')
// — it now only re-exports app-management functions. Auth needs its own
// modular import from 'firebase-admin/auth'. Confirmed by inspecting
// Object.keys(require('firebase-admin')) directly against the installed
// v14.1.0, not assumed from documentation.
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