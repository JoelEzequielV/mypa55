//MasterPassword.tsx
import { useState, useEffect } from "react";

import {
IonPage,
IonContent,
IonInput,
IonButton,
IonText,
IonSpinner,
IonProgressBar
} from "@ionic/react";

import bcrypt from "bcryptjs";

import { databaseService } from "../services/database";

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

const [strength,setStrength] = useState(0);

useEffect(()=>{

const init = async()=>{

await databaseService.initDB();

const saved = await databaseService.getMasterPassword();

if(saved){
setHasPassword(true);
}

setLoading(false);

};

init();

},[]);

/* -------------------------
PASSWORD STRENGTH
------------------------- */

const checkStrength = (pass:string)=>{

let score = 0;

if(pass.length > 6) score++;
if(pass.length > 10) score++;
if(/[A-Z]/.test(pass)) score++;
if(/[0-9]/.test(pass)) score++;
if(/[^A-Za-z0-9]/.test(pass)) score++;

setStrength(score/5);

};

/* -------------------------
CREAR PASSWORD
------------------------- */

const createPassword = async()=>{

setError("");

if(password.length < 6){

setError("La contraseña debe tener al menos 6 caracteres");

return;

}

if(password !== confirm){

setError("Las contraseñas no coinciden");

return;

}

const hash = bcrypt.hashSync(password,10);

await databaseService.setMasterPassword(hash);

alert("Contraseña maestra creada");

unlock();

};

/* -------------------------
VERIFICAR PASSWORD
------------------------- */

const verifyPassword = async()=>{

setError("");

const saved = await databaseService.getMasterPassword();

if(!saved) return;

const match = bcrypt.compareSync(password,saved);

if(match){

unlock();

}else{

setError("Contraseña incorrecta");

}

};

if(loading){

return(

<IonPage>

<IonContent className="ion-padding">

<IonSpinner/>

</IonContent>

</IonPage>

);

}

return(

<IonPage>

<IonContent className="ion-padding">

<h2 style={{textAlign:"center"}}>

{hasPassword
?"Desbloquear bóveda"
:"Crear contraseña maestra"}

</h2>

<IonInput
type="password"
placeholder="Contraseña"
value={password}
onIonChange={e=>{
setPassword(e.detail.value!)
checkStrength(e.detail.value!)
}}
/>

{!hasPassword && (

<>

<IonProgressBar value={strength}></IonProgressBar>

<IonInput
type="password"
placeholder="Confirmar contraseña"
value={confirm}
onIonChange={e=>setConfirm(e.detail.value!)}
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

<IonButton
expand="block"
color="medium"
onClick={unlock}
>

Usar seguridad del teléfono

</IonButton>

{hasPassword && (

<IonButton
expand="block"
color="warning"
onClick={forgot}
>

Olvidé mi contraseña

</IonButton>

)}

{error && (

<IonText color="danger">

<p style={{textAlign:"center"}}>{error}</p>

</IonText>

)}

</IonContent>

</IonPage>

);

};

export default MasterPassword;