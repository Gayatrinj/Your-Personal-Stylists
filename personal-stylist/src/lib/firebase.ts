// src/firebase.ts
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAScH6hyXD16J_Lka-qporcKOgGisVwcdE",
  authDomain: "personal-stylist-ecb94.firebaseapp.com",
  projectId: "personal-stylist-ecb94",
  storageBucket: "personal-stylist-ecb94.firebasestorage.app",
  messagingSenderId: "110730161469",
  appId: "1:110730161469:web:4fd51613e3185624eee954",
  measurementId: "G-N7D1562RSH", // fine to keep, we just won't use analytics here
};

export const firebaseApp = initializeApp(firebaseConfig);
