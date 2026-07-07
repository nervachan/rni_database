const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, 'firebase-service-account.json'));

// Check if already initialized
if (!admin.apps.length) {
    console.log('admin.credential:', typeof admin.credential);
    admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'rni-database'
  });
}

const auth = admin.auth();

module.exports = { admin, auth };