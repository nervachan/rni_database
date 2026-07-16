// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional.
// This apiKey is safe to keep here: Firebase web config is meant to be
// public — it identifies the project, it doesn't grant access on its
// own. Real access control happens through the custom claims the
// backend sets (see authMiddleware.cjs's requireRole()), not through
// keeping this object secret.
const firebaseConfig = {
  apiKey: "AIzaSyC-FiX8hIOLXbhDRo8w905-rZxoz9lLikc",
  authDomain: "rni-database.firebaseapp.com",
  projectId: "rni-database",
  storageBucket: "rni-database.firebasestorage.app",
  messagingSenderId: "847647033390",
  appId: "1:847647033390:web:c2977d0a2d9097ada9f7bf",
  measurementId: "G-FRG0KKNNSJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };