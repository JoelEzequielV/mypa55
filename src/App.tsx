//App.tsx
import { useState, useEffect } from "react";

import { IonApp, setupIonicReact } from "@ionic/react";

import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { runDailyBackup } from "./services/backupScheduler";

import Home from "./pages/Home";
import LockScreen from "./pages/LockScreen";
import MasterPassword from "./pages/MasterPassword";
import Settings from "./pages/Settings";
import SecurityRecovery from "./pages/SecurityRecovery";

import { databaseService } from "./services/database";
import { authenticateUser } from "./utils/biometric";

import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

import { tryAutoRestore } from "./services/autoRestore";


GoogleAuth.initialize();

setupIonicReact();

const AUTO_LOCK_TIME = 60000;

const App: React.FC = () => {

const [loading,setLoading] = useState(true);

const [locked,setLocked] = useState(true);

const [authenticated,setAuthenticated] = useState(false);

const [hasMasterPassword,setHasMasterPassword] = useState(false);

const [settingsMode,setSettingsMode] = useState(false);

const [recoveryMode,setRecoveryMode] = useState(false);

const [lastActivity,setLastActivity] = useState(Date.now());

/* -------------------------
INIT APP
------------------------- */

useEffect(()=>{

init();
runDailyBackup();
tryAutoRestore();
},[]);

const init = async ()=>{

await databaseService.initDB();

const saved = await databaseService.getMasterPassword();

if(saved){

setHasMasterPassword(true);

}else{

setHasMasterPassword(false);

setLocked(false);

}

setLoading(false);

};

/* -------------------------
ACTIVITY LISTENER
------------------------- */

useEffect(()=>{

const resetTimer = ()=>{

setLastActivity(Date.now());

};

window.addEventListener("click",resetTimer);
window.addEventListener("touchstart",resetTimer);

const interval = setInterval(()=>{

if(Date.now() - lastActivity > AUTO_LOCK_TIME){

setLocked(true);

setAuthenticated(false);

}

},5000);

let listener:any;

CapacitorApp.addListener("appStateChange",({isActive})=>{

if(!isActive){

sessionStorage.removeItem("vaultKey");

setLocked(true);

setAuthenticated(false);

}

}).then(l=>listener=l);

return ()=>{

window.removeEventListener("click",resetTimer);
window.removeEventListener("touchstart",resetTimer);

clearInterval(interval);

if(listener) listener.remove();

};

},[lastActivity]);

/* -------------------------
BIOMETRIC
------------------------- */

const unlockBiometric = async ()=>{

if(Capacitor.getPlatform()==="web"){

setLocked(false);

return;

}

const verified = await authenticateUser();

if(verified){

setLocked(false);

setAuthenticated(true);

}

};

/* -------------------------
RENDER
------------------------- */

if(loading){

return (

<IonApp>

<div style={{
display:"flex",
height:"100vh",
alignItems:"center",
justifyContent:"center"
}}>

Cargando...

</div>

</IonApp>

);

}

/* CREATE MASTER PASSWORD */

if(!hasMasterPassword){

return(

<IonApp>

<MasterPassword
unlock={()=>{
setAuthenticated(true);
setLocked(false);
setHasMasterPassword(true);
}}
/>

</IonApp>

);

}

/* LOCK SCREEN */

if(locked){

return(

<IonApp>

<LockScreen unlock={unlockBiometric}/>

</IonApp>

);

}

/* RECOVERY */

if(recoveryMode){

return(

<IonApp>

<SecurityRecovery goBack={()=>setRecoveryMode(false)}/>

</IonApp>

);

}

/* MASTER LOGIN */

if(!authenticated){

return(

<IonApp>

<MasterPassword
unlock={()=>setAuthenticated(true)}
forgot={()=>setRecoveryMode(true)}
/>

</IonApp>

);

}

/* SETTINGS */

if(settingsMode){

return(

<IonApp>

<Settings goBack={()=>setSettingsMode(false)}/>

</IonApp>

);

}

/* HOME */

return(

<IonApp>

<Home openSettings={()=>setSettingsMode(true)}/>

</IonApp>

);

};

export default App;