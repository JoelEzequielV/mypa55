//SecurityRecovery.tsx
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

import { checkPasswordStrength, validateMasterPassword } from "../utils/passwordStrength";

import { databaseService } from "../services/database";

interface Props{
goBack:()=>void
}

const SecurityRecovery:React.FC<Props> = ({goBack})=>{

const [question,setQuestion] = useState("");
const [savedAnswer,setSavedAnswer] = useState("");

const [answer,setAnswer] = useState("");

const [newPassword,setNewPassword] = useState("");
const [confirm,setConfirm] = useState("");

const [verified,setVerified] = useState(false);

const [loading,setLoading] = useState(true);
const [error,setError] = useState("");
const [msg,setMsg] = useState("");

const [strength,setStrength] = useState(0);
const [strengthText,setStrengthText] = useState("");

/* -------------------------
INIT
------------------------- */

useEffect(()=>{

const init = async()=>{

const data = await databaseService.getSecurityQuestion();

if(data){

setQuestion(data.security_question || data.question || "");
setSavedAnswer(data.security_answer || data.answer || "");

}

setLoading(false);

};

init();

},[]);

/* -------------------------
VERIFY ANSWER
------------------------- */

const verifyAnswer = ()=>{

setError("");

if(answer.trim().toLowerCase() === savedAnswer?.toLowerCase()){

setVerified(true);

}else{

setError("Respuesta incorrecta");

}

};

/* -------------------------
RESET PASSWORD
------------------------- */

const resetPassword = async()=>{

setError("");
setMsg("");

const validation = validateMasterPassword(newPassword);

if(validation){

setError(validation);
return;

}

if(newPassword !== confirm){

setError("Las contraseñas no coinciden");
return;

}

const hash = bcrypt.hashSync(newPassword,10);

await databaseService.setMasterPassword(hash);

setMsg("Contraseña actualizada correctamente");

setNewPassword("");
setConfirm("");

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

Recuperar contraseña

</h2>

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

{/* PREGUNTA */}

{!verified && (

<>

<p style={{textAlign:"center"}}>
{question || "No hay pregunta de seguridad configurada"}
</p>

<IonInput
placeholder="Respuesta"
value={answer}
clearOnEdit={false}
onIonInput={(e:any)=>setAnswer(e.detail.value!)}
/>

<br/>

<IonButton expand="block" onClick={verifyAnswer}>
Verificar respuesta
</IonButton>

</>

)}

{/* NUEVA CONTRASEÑA */}

{verified && (

<>

<h3>Nueva contraseña maestra</h3>

<IonInput
type="password"
placeholder="Nueva contraseña"
value={newPassword}
clearOnEdit={false}
onIonInput={(e:any)=>{
const value = e.detail.value!;
setNewPassword(value);

const result = checkPasswordStrength(value);

setStrength(result.level);
setStrengthText(result.text);
}}
/>

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

<br/>

<IonButton expand="block" onClick={resetPassword}>
Actualizar contraseña
</IonButton>

</>

)}

<br/>

<IonButton expand="block" color="medium" onClick={goBack}>
Volver
</IonButton>

</IonContent>

</IonPage>

);

};

export default SecurityRecovery;