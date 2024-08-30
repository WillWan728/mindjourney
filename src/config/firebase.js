import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA1xCU3os0daWWtfTJN9TxH87KAWhnIEOo",
  authDomain: "mindjourney-e72bf.firebaseapp.com",
  projectId: "mindjourney-e72bf",
  storageBucket: "mindjourney-e72bf.appspot.com",
  messagingSenderId: "201009747630",
  appId: "1:201009747630:web:a078e9b4ae5707afceff3f",
  measurementId: "G-G9SRZV5EQJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const db = getFirestore(app); 