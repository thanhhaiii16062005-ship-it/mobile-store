import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAu6kKZcYlTjKcqJfla647OYnwDcqz6G0E",
    authDomain: "mobile-store-14c48.firebaseapp.com",
    projectId: "mobile-store-14c48",
    storageBucket: "mobile-store-14c48.firebasestorage.app",
    messagingSenderId: "263546220720",
    appId: "1:263546220720:web:dd8f7ca23b123d54c74b75"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };