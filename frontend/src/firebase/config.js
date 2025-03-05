import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDI51gSiPuJL85VoK34JJGs__YJBH9XR3E",
    authDomain: "sentiment-analysis-49009.firebaseapp.com",
    projectId: "sentiment-analysis-49009",
    storageBucket: "sentiment-analysis-49009.firebasestorage.app",
    messagingSenderId: "669633328410",
    appId: "1:669633328410:web:87c18aded9f4eed20d68a3",
    measurementId: "G-3BKXXN60NK"
  };
  

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log('Firebase initialized:', !!app);

export { db };