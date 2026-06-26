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
 * 🛡️ CONTEXTO DE RED SEGURO (ipInfo API)
 * Ejecuta una consulta asíncrona y pasiva en segundo plano para obtener
 * los metadatos de ubicación e IP reales del cliente sin exponer el backend.
 */
export async function getNetworkContext() {
  try {
    const token = import.meta.env.VITE_VARIABLE_IP_INFO;
    
    // Si la variable está vacía o no se encuentra, saltamos directamente al fallback seguro
    if (!token) {
      return { ip: "127.0.0.1", country: "Local/Proxy", region: "Local" };
    }

    const res = await fetch(`https://ipinfo.io/json?token=${token}`);
    
    if (!res.ok) {
      throw new Error("Error de respuesta en ipInfo");
    }

    const data = await res.json();
    
    return {
      ip: data.ip || "0.0.0.0",
      country: data.country || "Desconocido",
      region: data.region || "Desconocida"
    };
  } catch (e) {
    // Fallback de contingencia en caso de bloqueos por AdBlockers o caídas del servicio externo
    return { ip: "127.0.0.1", country: "Local/Proxy", region: "Local" };
  }
}