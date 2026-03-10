import { useState, useEffect } from "react";

import { databaseService } from "./services/database";

import { IonApp, setupIonicReact } from "@ionic/react";

import { App as CapacitorApp } from "@capacitor/app";

import { Capacitor } from "@capacitor/core";

import Home from "./pages/Home";
import LockScreen from "./pages/LockScreen";

import { authenticateUser } from "./utils/biometric";

const AUTO_LOCK_TIME = 60000; // 60 seg

setupIonicReact();

const MyApp: React.FC = () => {

  const [lastActivity, setLastActivity] = useState(Date.now());

  const [locked, setLocked] = useState(true);

  const unlockApp = async () => {

    // Si estamos en web, desbloquear directamente
    if (Capacitor.getPlatform() === "web") {
      setLocked(false);
      return;
    }

    console.log("Intentando desbloquear...");

    const verified = await authenticateUser();

    console.log("Resultado:", verified); //resultado

    if (verified) {
      setLocked(false);
    }

  };

  useEffect(() => {

    databaseService.initDB();
  
    const resetTimer = () => {
      setLastActivity(Date.now());
    };
  
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("click", resetTimer);
  
    const interval = setInterval(() => {
  
      if (Date.now() - lastActivity > AUTO_LOCK_TIME) {
        setLocked(true);
      }
  
    }, 60000);
  
    // En web desbloquear automáticamente
    if (Capacitor.getPlatform() === "web") {
      setLocked(false);
    } else {
      unlockApp();
    }
  
    const listener = CapacitorApp.addListener("appStateChange", ({ isActive }) => {
  
      if (!isActive) {
        setLocked(true);
      }
  
    });
  
    // limpieza al desmontar
    return () => {
  
      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("click", resetTimer);
  
      clearInterval(interval);
  
      listener.remove();
  
    };
  
  }, []);

  return (

    <IonApp>

      {locked
        ? <LockScreen unlock={unlockApp} />
        : <Home />
      }

    </IonApp>

  );

};

export default MyApp;