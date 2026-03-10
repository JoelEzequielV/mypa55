//SecurityRecovery.tsx
import { useState, useEffect } from "react";

import {
IonPage,
IonContent,
IonInput,
IonButton,
IonText
} from "@ionic/react";

import bcrypt from "bcryptjs";

import { databaseService } from "../services/database";

interface Props{
goBack:()=>void
}

const SecurityRecovery:React.FC<Props> = ({goBack})=>{

const [question,setQuestion] = useState("");
const [answer,setAnswer] = useState("");
const [newPassword,setNewPassword] = useState("");
const [confirm,setConfirm] = useState("");
const [verified,setVerified] = useState(false);
const [error,setError] = useState("");

useEffect(()=>{

const loadQuestion = async()=>{

const q = await databaseService.getSecurityQuestion();

if(q){
setQuestion(q);
}

};

loadQuestion();

},[]);

/* ------------------
VERIFICAR RESPUESTA
------------------ */

const verifyAnswer = async()=>{

const ok = await databaseService.verifySecurityAnswer(answer);

if(ok){
setVerified(true);
}else{
setError("Respuesta incorrecta");
}

};

/* ------------------
CAMBIAR PASSWORD
------------------ */

const changePassword = async()=>{

if(newPassword !== confirm){

setError("Las contraseñas no coinciden");
return;

}

const hash = bcrypt.hashSync(newPassword,10);

await databaseService.setMasterPassword(hash);

alert("Contraseña cambiada");

goBack();

};

/* ------------------
RESET APP
------------------ */

const resetApp = async()=>{

const confirmReset = window.confirm(
"Esto borrará todas las contraseñas. ¿Continuar?"
);

if(!confirmReset) return;

await databaseService.resetApp();

window.location.reload();

};

return(

<IonPage>

<IonContent className="ion-padding">

<h2>Recuperar acceso</h2>

{!verified ? (

<>

<p>{question || "No hay pregunta configurada"}</p>

<IonInput
placeholder="Respuesta"
value={answer}
onIonChange={e=>setAnswer(e.detail.value!)}
/>

<br/>

<IonButton expand="block" onClick={verifyAnswer}>
Verificar respuesta
</IonButton>

</>

) : (

<>

<h3>Nueva contraseña maestra</h3>

<IonInput
type="password"
placeholder="Nueva contraseña"
value={newPassword}
onIonChange={e=>setNewPassword(e.detail.value!)}
/>

<IonInput
type="password"
placeholder="Confirmar"
value={confirm}
onIonChange={e=>setConfirm(e.detail.value!)}
/>

<br/>

<IonButton expand="block" onClick={changePassword}>
Guardar nueva contraseña
</IonButton>

</>

)}

<br/>

<IonButton expand="block" color="danger" onClick={resetApp}>
Resetear aplicación
</IonButton>

<IonButton expand="block" color="medium" onClick={goBack}>
Volver
</IonButton>

{error && (

<IonText color="danger">
<p>{error}</p>
</IonText>

)}

</IonContent>

</IonPage>

);

};

export default SecurityRecovery;