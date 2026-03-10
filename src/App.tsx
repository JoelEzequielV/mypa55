//App.tsx
import { useState, useEffect } from "react";

import { databaseService } from "./services/database";

import { IonApp, setupIonicReact } from "@ionic/react";

import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

import Settings from "./pages/Settings";
import Home from "./pages/Home";
import LockScreen from "./pages/LockScreen";
import MasterPassword from "./pages/MasterPassword";
import SecurityRecovery from "./pages/SecurityRecovery";

import { authenticateUser } from "./utils/biometric";

const AUTO_LOCK_TIME = 60000;

setupIonicReact();

const MyApp: React.FC = () => {

  const [lastActivity, setLastActivity] = useState(Date.now());

  const [locked, setLocked] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const [recoveryMode,setRecoveryMode] = useState(false);
  const [settingsMode, setSettingsMode] = useState(false);

  const unlockBiometric = async () => {

    if (Capacitor.getPlatform() === "web") {
      setLocked(false);
      return;
    }

    const verified = await authenticateUser();

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
        setAuthenticated(false);
      }
    
    }, 1000);

    if (Capacitor.getPlatform() === "web") {
      setLocked(false);
    } else {
      unlockBiometric();
    }

    let listener: any;

    CapacitorApp.addListener("appStateChange", ({ isActive }) => {

      if (!isActive) {
        setLocked(true);
        setAuthenticated(false);
      }

    }).then(l => {
      listener = l;
    });

    return () => {

      window.removeEventListener("touchstart", resetTimer);
      window.removeEventListener("click", resetTimer);

      clearInterval(interval);

      if (listener) {
        listener.remove();
      }

    };

  }, []);

  return (

    <IonApp>

        {locked ? (

        <LockScreen unlock={unlockBiometric} />

        ) : recoveryMode ? (

        <SecurityRecovery goBack={()=>setRecoveryMode(false)} />

        ) : !authenticated ? (

        <MasterPassword
          unlock={()=>setAuthenticated(true)}
          forgot={()=>setRecoveryMode(true)}
        />

        ) : settingsMode ? (

        <Settings goBack={()=>setSettingsMode(false)} />

        ) : (

        <Home openSettings={()=>setSettingsMode(true)} />

        )}

    </IonApp>

  );

};

export default MyApp;