import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

//배포용
// const firebaseConfig = {
//     apiKey: process.env.NEXT_PUBLIC_KEY,
//     authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
//     projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
//     storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
//     messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
//     appId: process.env.NEXT_PUBLIC_APP_ID,
// };
const firebaseConfig = {
    apiKey: "AIzaSyANw6jE7NE7yF6F8TYYJalVwD2FuOLTqJ0",
    authDomain: "taku-e9992.firebaseapp.com",
    projectId: "taku-e9992",
    storageBucket: "taku-e9992.appspot.com",
    messagingSenderId: "139053130279",
    appId: "1:139053130279:web:ae70760c52da59bb6b2402",
};

let firebase;
if (!getApps().length) firebase = initializeApp(firebaseConfig);

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const authService = getAuth(app);
export const dbService = getFirestore(app);
export const storage = getStorage(app);
