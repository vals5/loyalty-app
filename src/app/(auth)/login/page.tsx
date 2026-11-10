import { redirect } from "next/navigation";

// El inicio (/) ya es la pantalla de ingreso. Esta ruta queda para los links viejos.
export default function LoginPage() {
  redirect("/");
}
