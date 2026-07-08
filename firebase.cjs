const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    return JSON.parse(json);
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  const candidatePaths = [
    path.join(__dirname, 'firebase-service-account.json'),
    path.join(__dirname, 'src', 'firebase-service-account.json'),
  ];
  const localPath = candidatePaths.find((candidate) => fs.existsSync(candidate));
  if (localPath) {
    return require(localPath);
  }

  throw new Error(
    'Firebase service account not configured. Set FIREBASE_SERVICE_ACCOUNT_BASE64 (or FIREBASE_SERVICE_ACCOUNT) env var, or place firebase-service-account.json locally.'
  );
}

const serviceAccount = loadServiceAccount();

// Check if already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id || 'rni-database'
  });
}

const auth = admin.auth();

module.exports = { admin, auth };