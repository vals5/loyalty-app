import { FirebaseError } from "firebase/app";

const MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "Ya existe una cuenta con ese email.",
  "auth/invalid-email": "El email no es válido.",
  "auth/missing-email": "Ingresá tu email.",
  "auth/weak-password": "La contraseña es muy débil (mínimo 8 caracteres).",
  "auth/invalid-credential": "Email o contraseña incorrectos.",
  "auth/user-not-found": "Email o contraseña incorrectos.",
  "auth/wrong-password": "Email o contraseña incorrectos.",
  "auth/user-disabled": "Esta cuenta está deshabilitada.",
  "auth/too-many-requests": "Demasiados intentos. Esperá unos minutos e intentá de nuevo.",
  "auth/network-request-failed": "Sin conexión. Revisá tu internet.",
  "auth/operation-not-allowed":
    "El login con email/contraseña no está habilitado en Firebase Authentication.",
  "permission-denied":
    "No se pudo crear el negocio: ese enlace ya está en uso o las reglas lo rechazaron.",
};

export function authErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    return MESSAGES[err.code] ?? `Error inesperado (${err.code}).`;
  }
  return "Ocurrió un error inesperado. Intentá de nuevo.";
}