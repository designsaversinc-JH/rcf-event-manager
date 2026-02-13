const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

const getFirebaseConfig = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  return {
    projectId,
    clientEmail,
    privateKey,
    storageBucket,
  };
};

const isFirebaseAdminConfigured = () => {
  const config = getFirebaseConfig();
  return Boolean(config.projectId && config.clientEmail && config.privateKey);
};

const getFirebaseAdminApp = () => {
  if (!isFirebaseAdminConfigured()) {
    const error = new Error('Firebase Admin is not configured on the server.');
    error.status = 500;
    throw error;
  }

  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  const { projectId, clientEmail, privateKey, storageBucket } = getFirebaseConfig();

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket,
  });
};

const verifyFirebaseIdToken = async (idToken) => {
  const app = getFirebaseAdminApp();
  const auth = getAuth(app);
  return auth.verifyIdToken(idToken);
};

const getFirestoreDb = () => {
  const app = getFirebaseAdminApp();
  return getFirestore(app);
};

module.exports = {
  isFirebaseAdminConfigured,
  verifyFirebaseIdToken,
  getFirestoreDb,
};
