//Settings.tsx
import { useState } from "react";

import {
IonPage,
IonContent,
IonInput,
IonButton,
IonText,
IonProgressBar
} from "@ionic/react";

import bcrypt from "bcryptjs";

import { databaseService } from "../services/database";

interface Props{
goBack:()=>void
}

const Settings:React.FC<Props> = ({goBack})=>{

/* -------------------------
STATE
------------------------- */

const [newPassword,setNewPassword] = useState("");
const [confirm,setConfirm] = useState("");

const [question,setQuestion] = useState("");
const [answer,setAnswer] = useState("");

const [msg,setMsg] = useState("");
const [error,setError] = useState("");

const [strength,setStrength] = useState(0);

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
VALIDATE MASTER PASSWORD
------------------------- */

const validatePassword = ()=>{

if(newPassword.length < 6){

setError("La contraseña debe tener al menos 6 caracteres");
return false;

}

if(!/[A-Z]/.test(newPassword)){

setError("Debe incluir al menos una letra mayúscula");
return false;

}

if(!/[0-9]/.test(newPassword)){

setError("Debe incluir al menos un número");
return false;

}

if(newPassword !== confirm){

setError("Las contraseñas no coinciden");
return false;

}

return true;

};

/* -------------------------
CHANGE MASTER PASSWORD
------------------------- */

const changeMasterPassword = async()=>{

setError("");
setMsg("");

const valid = validatePassword();

if(!valid) return;

const hash = bcrypt.hashSync(newPassword,10);

await databaseService.setMasterPassword(hash);

setMsg("Contraseña maestra actualizada correctamente");

setNewPassword("");
setConfirm("");

};

/* -------------------------
VALIDATE SECURITY QUESTION
------------------------- */

const validateSecurity = ()=>{

if(question.length < 5){

setError("La pregunta debe tener al menos 5 caracteres");
return false;

}

if(answer.length < 3){

setError("La respuesta debe tener al menos 3 caracteres");
return false;

}

const qLower = question.toLowerCase();
const aLower = answer.toLowerCase();

if(qLower.includes(aLower)){

setError("La respuesta no puede aparecer dentro de la pregunta");
return false;

}

return true;

};

/* -------------------------
SAVE SECURITY QUESTION
------------------------- */

const saveSecurityQuestion = async()=>{

setError("");
setMsg("");

const valid = validateSecurity();

if(!valid) return;

await databaseService.setSecurityQuestion(question,answer);

setMsg("Pregunta de seguridad guardada");

setQuestion("");
setAnswer("");

};

/* -------------------------
DISABLE MASTER PASSWORD
------------------------- */

const disableMasterPassword = async()=>{

setError("");
setMsg("");

await databaseService.disableMasterPassword();

setMsg("Contraseña maestra desactivada");

};

/* -------------------------
UI
------------------------- */

return(

<IonPage>

<IonContent className="ion-padding">

<h2 style={{textAlign:"center"}}>Configuración de seguridad</h2>

{/* -------------------------
MESSAGES
------------------------- */}

{error && (

<IonText color="danger">
<p style={{textAlign:"center"}}>{error}</p>
</IonText>

)}

{msg && (

<IonText color="success">
<p style={{textAlign:"center"}}>{msg}</p>
</IonText>

)}

{/* -------------------------
MASTER PASSWORD
------------------------- */}

<h3>Cambiar contraseña maestra</h3>

<IonInput
type="password"
placeholder="Nueva contraseña"
value={newPassword}
onIonChange={e=>{
setNewPassword(e.detail.value!)
checkStrength(e.detail.value!)
}}
/>

<IonProgressBar value={strength}></IonProgressBar>

<IonInput
type="password"
placeholder="Confirmar contraseña"
value={confirm}
onIonChange={e=>setConfirm(e.detail.value!)}
/>

<br/>

<IonButton expand="block" onClick={changeMasterPassword}>
Actualizar contraseña maestra
</IonButton>

{/* -------------------------
SECURITY QUESTION
------------------------- */}

<br/>

<h3>Pregunta de recuperación</h3>

<IonInput
placeholder="Escribe tu pregunta de seguridad"
value={question}
onIonChange={e=>setQuestion(e.detail.value!)}
/>

<IonInput
placeholder="Respuesta"
value={answer}
onIonChange={e=>setAnswer(e.detail.value!)}
/>

<br/>

<IonButton expand="block" onClick={saveSecurityQuestion}>
Guardar pregunta de seguridad
</IonButton>

{/* -------------------------
DISABLE MASTER PASSWORD
------------------------- */}

<br/>

<IonButton
expand="block"
color="warning"
onClick={disableMasterPassword}
>
Desactivar contraseña maestra
</IonButton>

{/* -------------------------
BACK BUTTON
------------------------- */}

<br/>

<IonButton
expand="block"
color="medium"
onClick={goBack}
>
Volver al inicio
</IonButton>


</IonContent>

</IonPage>

);

};

export default Settings;