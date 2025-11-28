import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyBK1OQd2jCwZKU2MMkjBVu2gssOQ1dfvjs",
    authDomain: "loan-default-prediction-59241.firebaseapp.com",
    projectId: "loan-default-prediction-59241",
    storageBucket: "loan-default-prediction-59241.firebasestorage.app",
    messagingSenderId: "1065399079822",
    appId: "1:1065399079822:web:d0f32f172aa3b7d9fc4adf",
    measurementId: "G-DY118TWY51"
  },

  model_api_url: '' // Insert your local or deployed model API URL here
};

const app = initializeApp(environment.firebase);
