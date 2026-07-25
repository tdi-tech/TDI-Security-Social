import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Vite expone las variables de entorno a través de import.meta.env
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'tdi-secure-social';

/**
 * 🛡️ CONTEXTO DE RED SEGURO (ipQuery API)
 * Extrae IP, país y región en segundo plano de forma 100% gratuita,
 * sin necesidad de tokens ni variables sensibles expuestas en Vite.
 */
export async function getNetworkContext() {
  try {
    const res = await fetch('https://api.ipquery.io/?format=json');
    
    if (!res.ok) {
      throw new Error("Error en servicio de IP");
    }

    const data = await res.json();
    
    return {
      ip: data.ip || "0.0.0.0",
      country: data.location?.country || data.country || "Desconocido",
      region: data.location?.state || data.region || "Desconocida"
    };
  } catch (e) {
    // Fallback de contingencia en caso de bloqueos locales o adblockers
    return { ip: "127.0.0.1", country: "Local/Proxy", region: "Local" };
  }
}