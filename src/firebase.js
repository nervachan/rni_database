// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };