import { initializeApp } from "firebase/app";

// Lee la variable de entorno NEXT_PUBLIC_FIREBASE_CONFIG
// Esta debe contener el JSON completo de tu configuración Firebase
const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_CONFIG
  ? JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)
  : {};

const app = initializeApp(firebaseConfig);

export default app;
