//src/pages/Settings.tsx
import { useState } from "react";
import "./Home.css";
import {
IonPage,
IonContent,
IonInput,
IonButton,
IonText,
IonProgressBar,
IonIcon,
IonItem,
IonAlert,
IonCard
} from "@ionic/react";

import { restoreBackupFromDrive } from "../services/gdriveBackup";

import { uploadBackupToDrive } from "../services/gdriveBackup";

import { eye, eyeOff } from 'ionicons/icons';

import bcrypt from "bcryptjs";

import { databaseService } from "../services/database";

import {
previewEncryptedBackup,
exportEncryptedBackup,
importEncryptedBackup
} from "../utils/backup";

interface Props{
goBack:()=>void
}

const Settings:React.FC<Props> = ({goBack})=>{

const [newPassword,setNewPassword] = useState("");
const [confirm,setConfirm] = useState("");

const [question,setQuestion] = useState("");
const [answer,setAnswer] = useState("");

const [msg,setMsg] = useState("");
const [error,setError] = useState("");

const [strength,setStrength] = useState(0);

const [backupKey,setBackupKey] = useState("");
const [showPassword,setShowPassword] = useState(false);
const [showPassword2,setShowPassword2] = useState(false);

const [importPassword,setImportPassword] = useState("");
const [preview,setPreview] = useState<any>(null);
const [importProgress,setImportProgress] = useState(0);

const checkStrength = (pass:string)=>{

let score = 0;

if(pass.length > 6) score++;
if(pass.length > 10) score++;
if(/[A-Z]/.test(pass)) score++;
if(/[0-9]/.test(pass)) score++;
if(/[^A-Za-z0-9]/.test(pass)) score++;

setStrength(score/5);

};

const validatePassword = ()=>{

if(newPassword.length < 8){

setError("La contraseña debe tener al menos 8 caracteres");
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

const changeMasterPassword = async()=>{

setError("");
setMsg("");

const valid = validatePassword();

if(!valid) return;

const hash = bcrypt.hashSync(newPassword,10);

await databaseService.setMasterPassword(hash);

setMsg("Contraseña maestra actualizada");

setNewPassword("");
setConfirm("");

};

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

const saveSecurityQuestion = async()=>{

setError("");
setMsg("");

const valid = validateSecurity();

if(!valid) return;

await databaseService.setSecurityQuestion(question,answer);

setMsg("Pregunta guardada");

setQuestion("");
setAnswer("");

};

/* -----------------------------
EXPORT BACKUP
----------------------------- */

const exportBackup = async()=>{

setError("");
setMsg("");

if(!backupKey){

setError("Debes escribir una clave para cifrar el backup");
return;

}

try{

const filename = await exportEncryptedBackup(backupKey);

setMsg(`Backup exportado como ${filename}. 
Se guardó en la carpeta Descargas. 
Guarda también la clave usada.`);

}catch(e:any){

setError(e.message || "Error al exportar");

}

localStorage.setItem("backup_key",backupKey);

};

/* -----------------------------
IMPORT BACKUP
----------------------------- */

const importBackup = async(e:any)=>{

setError("");
setMsg("");

const file = e.target.files[0];

if(!file){
setError("Debes seleccionar un archivo");
return;
}

if(!importPassword){
setError("Debes escribir la contraseña del backup");
return;
}

try{

const result = await previewEncryptedBackup(file,importPassword);

setPreview(result);

}catch(e:any){

setError(e.message || "No se pudo leer el backup");

}

};

/* -----------------------------
RESTORE BACKUP
----------------------------- */
const restoreBackup = async()=>{

if(!preview){
setError("Primero selecciona un backup válido");
return;
}

setImportProgress(0);

try{

const total = await importEncryptedBackup(
preview.data,
(p)=>setImportProgress(p)
);

setMsg(`Backup restaurado correctamente.
${total} contraseñas importadas.`);

setPreview(null);

}catch(e:any){

setError(e.message || "Error al restaurar");

}

};


return(

<IonPage>

<IonContent className="ion-padding">

<h2 style={{textAlign:"center"}}>Configuración</h2>

<IonAlert
  isOpen={!!error}
  header="Error"
  message={error}
  buttons={[
    {
      text: "OK",
      handler: () => setError("")
    }
  ]}
/>

<IonAlert
  isOpen={!!msg}
  header="Correcto"
  message={msg}
  buttons={[
    {
      text: "OK",
      handler: () => setMsg("")
    }
  ]}
/>


<IonCard color="light" style={{padding:"10px", border:"1px solid lightgray"}}>

<h3>Cambiar contraseña maestra</h3>
<IonItem >

<IonInput
type={showPassword ? "text":"password"}
placeholder="Nueva contraseña"
value={newPassword}
clearOnEdit={false}
onIonInput={(e:any)=>{
setNewPassword(e.detail.value!)
checkStrength(e.detail.value!)
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
<IonProgressBar value={strength}></IonProgressBar>


<IonItem>
<IonInput
type={showPassword2 ? "text":"password"}
placeholder="Confirmar contraseña"
value={confirm}
clearOnEdit={false}
onIonInput={(e:any)=>setConfirm(e.detail.value!)}
/>
<IonButton
fill="clear"
slot="end"
onClick={()=>setShowPassword2(!showPassword2)}
>
<IonIcon icon={showPassword2 ? eyeOff : eye}/>
</IonButton>
</IonItem>
<br/>

<IonButton expand="block" onClick={changeMasterPassword}>
Actualizar contraseña maestra
</IonButton>

</IonCard>
<br/>

<IonCard color="light" style={{padding:"10px", border:"1px solid lightgray"}}>
<h3>Pregunta de recuperación</h3>

<IonInput
placeholder="Pregunta de seguridad"
value={question}
clearOnEdit={false}
onIonInput={(e:any)=>setQuestion(e.detail.value!)}
/>

<IonInput
placeholder="Respuesta"
value={answer}
clearOnEdit={false}
onIonInput={(e:any)=>setAnswer(e.detail.value!)}
/>

<br/>

<IonButton expand="block" onClick={saveSecurityQuestion}>
Guardar pregunta
</IonButton>

</IonCard>
<br/>

<IonCard color="light" style={{padding:"10px", border:"1px solid lightgray"}}>
<h3>Backup cifrado</h3>

<p style={{fontSize:"13px",color:"#666"}}>
El backup se guardará como un archivo cifrado.
Necesitarás esta contraseña para restaurarlo más adelante.
</p>
<IonItem>
<IonInput
type="password"
placeholder="contraseña para el backup"
value={backupKey}
clearOnEdit={false}
onIonInput={(e:any)=>setBackupKey(e.detail.value!)}
/>
</IonItem>
<br/>

<IonButton expand="block" onClick={exportBackup}>
Exportar backup
</IonButton>
</IonCard>
<br/>
<IonCard color="light" style={{padding:"10px", border:"1px solid lightgray"}}>
<p style={{fontSize:"13px",color:"#666"}}>
Primero ingresa contraseña del backup luego importa el .vault</p>
<IonItem>
<IonInput
type="password"
placeholder="contraseña del backup"
value={importPassword}
onIonInput={(e:any)=>setImportPassword(e.detail.value!)}
/>
</IonItem>

<br/>

<IonButton expand="block">
Seleccionar archivo backup
<input
type="file"
accept=".vault"
onChange={importBackup}
style={{
opacity:0,
position:"absolute",
width:"100%",
height:"100%"
}}
/>
</IonButton>
{preview && (

<IonCard style={{padding:"10px"}}>

<p>
Backup detectado con <b>{preview.count}</b> contraseñas
</p>

<IonButton
expand="block"
color="success"
onClick={restoreBackup}
>
Restaurar backup
</IonButton>

<IonProgressBar value={importProgress}></IonProgressBar>

</IonCard>

)}

</IonCard>
<br/>
<IonButton expand="block" onClick={async()=>{

try{

await uploadBackupToDrive(backupKey);

setMsg("Backup subido a Google Drive");

}catch(e:any){

setError("No se pudo subir el backup");

}

}}>
Backup en Google Drive
</IonButton>
<br />
<IonButton expand="block" color="tertiary" onClick={async()=>{

if(!importPassword){
setError("Debes escribir la contraseña del backup");
return;
}

try{

const total = await restoreBackupFromDrive(importPassword);

setMsg(`Backup restaurado desde Google Drive.
${total} contraseñas importadas.`);

}catch(e:any){

setError(e.message || "Error restaurando backup");

}

}}>
Restaurar desde Google Drive
</IonButton>
<br />
<IonButton
expand="block"
color="medium"
onClick={goBack}
>
Volver al inicio
</IonButton>
<br /><br /><br />
</IonContent>

</IonPage>

);

};

export default Settings;