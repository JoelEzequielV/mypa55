//MasterPassword.tsx

import { useState, useEffect } from "react";

import {
IonPage,
IonContent,
IonInput,
IonButton,
IonText,
IonSpinner,
IonProgressBar,
IonAlert,
IonIcon,
IonItem
} from "@ionic/react";

import { eye, eyeOff, star, starOutline, copy, trash, add } from 'ionicons/icons';

import bcrypt from "bcryptjs";

import { databaseService } from "../services/database";

import { deriveKey, generateSalt } from "../utils/encryption";

import { biometricService } from "../services/biometricService";

interface Props{
unlock:()=>void
forgot:()=>void
}

const MasterPassword:React.FC<Props> = ({unlock,forgot})=>{

const [password,setPassword] = useState("");
const [confirm,setConfirm] = useState("");
const [hasPassword,setHasPassword] = useState(false);
const [loading,setLoading] = useState(true);
const [error,setError] = useState("");
const [showPassword,setShowPassword] = useState(false);
const [strength,setStrength] = useState(0);
const [strengthText,setStrengthText] = useState("");

const [showAlert,setShowAlert] = useState(false);

const [biometricAvailable,setBiometricAvailable] = useState(false);

/* -------------------------
INIT
------------------------- */

useEffect(()=>{

const init = async()=>{

await databaseService.initDB();

const saved = await databaseService.getMasterPassword();

if(saved){
setHasPassword(true);
}

const bio = await biometricService.isAvailable();
setBiometricAvailable(bio);

setLoading(false);

};

init();

},[]);

/* -------------------------
PASSWORD STRENGTH
------------------------- */

const checkStrength = (pass:string)=>{

let score = 0;

if(pass.length >= 8) score++;
if(pass.length >= 12) score++;
if(/[A-Z]/.test(pass)) score++;
if(/[0-9]/.test(pass)) score++;
if(/[^A-Za-z0-9]/.test(pass)) score++;

const level = score/5;

setStrength(level);

if(level <= 0.2) setStrengthText("Muy débil");
else if(level <= 0.4) setStrengthText("Débil");
else if(level <= 0.6) setStrengthText("Aceptable");
else if(level <= 0.8) setStrengthText("Fuerte");
else setStrengthText("Muy fuerte");

};

/* -------------------------
VALIDACIÓN
------------------------- */

const validatePassword = (pass:string)=>{

if(pass.length < 8){

setError("La contraseña debe tener al menos 8 caracteres");
return false;

}

if(!/[A-Z]/.test(pass)){

setError("Debe contener al menos una letra mayúscula");
return false;

}

if(!/[0-9]/.test(pass)){

setError("Debe contener al menos un número");
return false;

}

return true;

};

/* -------------------------
CREAR PASSWORD
------------------------- */

const createPassword = async () => {

setError("");

if(!validatePassword(password)) return;

if(password !== confirm){

setError("Las contraseñas no coinciden");
return;

}

const salt = generateSalt();

localStorage.setItem("vault_salt",salt);

const key = deriveKey(password,salt);

sessionStorage.setItem("vaultKey",key);

await biometricService.storeKey(key);

const hash = bcrypt.hashSync(password,10);

await databaseService.setMasterPassword(hash);

setShowAlert(true);

unlock();

};

/* -------------------------
VERIFICAR PASSWORD
------------------------- */

const verifyPassword = async () => {

setError("");

const saved = await databaseService.getMasterPassword();

if(!saved) return;

const match = bcrypt.compareSync(password,saved);

if(match){

const salt = localStorage.getItem("vault_salt");

if(!salt){
setError("Error de seguridad");
return;
}

const key = deriveKey(password,salt);

sessionStorage.setItem("vaultKey",key);

await biometricService.storeKey(key);

unlock();

}else{

sessionStorage.removeItem("vaultKey");

setError("Contraseña incorrecta");

}

};

/* -------------------------
BIOMETRIC LOGIN
------------------------- */

const biometricLogin = async()=>{

const auth = await biometricService.authenticate();

if(!auth){

setError("Autenticación fallida");
return;

}

const key = await biometricService.getKey();

if(!key){

setError("Primero inicia con contraseña");
return;

}

sessionStorage.setItem("vaultKey",key);

unlock();

};

/* -------------------------
LOADING
------------------------- */

if(loading){

return(

<IonPage>

<IonContent className="ion-padding">

<IonSpinner/>

</IonContent>

</IonPage>

);

}

/* -------------------------
UI
------------------------- */

return(

<IonPage>

<IonContent className="ion-padding">

<h2 style={{textAlign:"center"}}>

{hasPassword
?"Desbloquear bóveda"
:"Crear contraseña maestra"}

</h2>

{error && (

<IonText color="danger">

<p style={{textAlign:"center"}}>{error}</p>

</IonText>

)}

<IonItem>

<IonInput
type={showPassword ? "text":"password"}
placeholder="Contraseña"
value={password}
clearOnEdit={false}
onIonInput={(e:any)=>{
const value = e.detail.value!;
setPassword(value);
checkStrength(value);
}}
/>

<IonButton
fill="clear"
slot="end"
onClick={()=>setShowPassword(!showPassword)}
>
<IonIcon icon={showPassword ? eyeOff : eye}/>
</IonButton>

</IonItem>

{!hasPassword && (

<>

<IonProgressBar value={strength}></IonProgressBar>

<p style={{textAlign:"center",fontSize:"12px"}}>
Seguridad: {strengthText}
</p>

<IonInput
type="password"
placeholder="Confirmar contraseña"
value={confirm}
clearOnEdit={false}
onIonInput={(e:any)=>setConfirm(e.detail.value!)}
/>

</>

)}

<br/>

<IonButton
expand="block"
onClick={hasPassword?verifyPassword:createPassword}
>

{hasPassword
?"Desbloquear"
:"Crear contraseña"}

</IonButton>

{biometricAvailable && hasPassword && (

<IonButton
expand="block"
color="success"
onClick={biometricLogin}
>

Desbloquear con huella

</IonButton>

)}

{hasPassword && (

<IonButton
expand="block"
color="warning"
onClick={forgot}
>

Olvidé mi contraseña

</IonButton>

)}

<IonAlert
isOpen={showAlert}
header="Contraseña creada"
message="La contraseña maestra se creó correctamente."
buttons={["OK"]}
onDidDismiss={()=>setShowAlert(false)}
/>

</IonContent>

</IonPage>

);

};

export default MasterPassword;