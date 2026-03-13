import { uploadBackupToDrive } from "./gdriveBackup";

export const runDailyBackup = async ()=>{

const last = localStorage.getItem("last_backup");

const now = Date.now();

if(last){

const diff = now - Number(last);

/* 24 horas */

if(diff < 86400000){
return;
}

}

const backupKey = localStorage.getItem("backup_key");

if(!backupKey) return;

try{

await uploadBackupToDrive(backupKey);

localStorage.setItem("last_backup",now.toString());

console.log("Backup diario completado");

}catch(e){

console.log("Backup diario falló");

}

};