import React from "react";
import ReactDOM from "react-dom";
import App from "./app"; 
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

ReactDOM.render(<App />, document.getElementById("root"));

const firebaseConfig = {
    apiKey: "AIzaSyAleqWWyqkV-Tb7Y1M0519d0uKft_x-XmY",
    authDomain: "mindjourney-b42b5.firebaseapp.com",
    databaseURL: "https://mindjourney-b42b5-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mindjourney-b42b5",
    storageBucket: "mindjourney-b42b5.appspot.com",
    messagingSenderId: "21313961207",
    appId: "1:21313961207:web:3c44bb51600eb5dd45e7f2",
    measurementId: "G-YHFCH82JLG"
  };

  // Initialize Firebase
//const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
