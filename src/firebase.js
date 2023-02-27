import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "my-bank-application2023.firebaseapp.com",
  projectId: "my-bank-application2023",
  storageBucket: "my-bank-application2023.appspot.com",
  messagingSenderId: "895958143355",
  appId: "1:895958143355:web:f8aecc79f3af8a52332dde",
  measurementId: "G-FPYD4PZJWB"
};
  
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, analytics, auth, firestore };
