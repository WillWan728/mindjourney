import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import firebase from "firebase/app"; // Import Firebase SDK core
import "firebase/firestore"; // Import Firestore if you need it
import "firebase/auth"; // Import Authentication if you need it
import "./index.css"; // Assuming you have an index.css for global styles

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {npm install -g firebase-tools
  apiKey: "AIzaSyAleqWWyqkV-Tb7Y1M0519d0uKft_x-XmY",
  authDomain: "mindjourney-b42b5.firebaseapp.com",
  projectId: "mindjourney-b42b5",
  storageBucket: "mindjourney-b42b5.appspot.com",
  messagingSenderId: "21313961207",
  appId: "1:21313961207:web:3c44bb51600eb5dd45e7f2",
  measurementId: "G-YHFCH82JLG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);