import { useState, useEffect } from "react";

import { IonApp, setupIonicReact } from "@ionic/react";

import { App as CapacitorApp } from "@capacitor/app";

import Home from "./pages/Home";
import LockScreen from "./pages/LockScreen";

import { authenticateUser } from "./utils/biometric";

const AUTO_LOCK_TIME = 60000; // 60 seg

setupIonicReact();

const MyApp: React.FC = () => {

  const [lastActivity, setLastActivity] = useState(Date.now());

  const [locked, setLocked] = useState(true);

  const unlockApp = async () => {

    console.log("Intentando desbloquear...");
  
    const verified = await authenticateUser();
  
    console.log("Resultado:", verified);
  
    if (verified) {
      setLocked(false);
    }
  
  };

  useEffect(() => {

    const resetTimer = () => {
      setLastActivity(Date.now());
    };
    
    window.addEventListener("touchstart", resetTimer);
    window.addEventListener("click", resetTimer);

    setInterval(() => {

      if (Date.now() - lastActivity > AUTO_LOCK_TIME) {
        setLocked(true);
      }
    
    }, 5000);

    unlockApp();

    CapacitorApp.addListener("appStateChange", ({ isActive }) => {

      if (!isActive) {
        setLocked(true);
      }

    });

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