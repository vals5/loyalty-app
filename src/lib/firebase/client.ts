import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

// Next reemplaza NEXT_PUBLIC_* de forma estática: hay que escribirlas literales.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error("Faltan variables NEXT_PUBLIC_FIREBASE_* en .env.local");
}

// Singleton: reutiliza la app existente (HMR y múltiples imports).
export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
function createDb(): Firestore {
  try {
    return initializeFirestore(app, {
      // Si el streaming (WebChannel) está bloqueado o es muy lento —típico en redes móviles—
      // pasa solo a long-polling en vez de quedarse esperando.
      experimentalAutoDetectLongPolling: true,
      // Caché en el dispositivo (IndexedDB): lo ya visto se muestra al instante. Solo en el navegador.
      ...(typeof window !== "undefined"
        ? { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) }
        : {}),
    });
  } catch {
    // Ya estaba inicializado (recarga en caliente): se reutiliza
    return getFirestore(app);
  }
}
export const db: Firestore = createDb();
