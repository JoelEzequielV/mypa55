import { BiometricAuth } from "@aparajita/capacitor-biometric-auth";

let attempts = 0;

export const authenticateUser = async () => {

  try {

    await BiometricAuth.authenticate({
      reason: "Desbloquear gestor de contraseñas, si falla 15 intentos se borraran todos los datos",
      cancelTitle: "Cancelar",
      allowDeviceCredential: true
    });

    attempts = 0;

    return true;

  } catch (error) {

    attempts++;

    if (attempts >= 15) {

      localStorage.clear();

      alert("Demasiados intentos fallidos. Datos eliminados.");

    }

    return false;

  }

};