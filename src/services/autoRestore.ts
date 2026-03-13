import { restoreBackupFromDrive } from "./gdriveBackup";

export const tryAutoRestore = async () => {

const restored = localStorage.getItem("drive_auto_restored");

if(restored){
return;
}

const backupKey = localStorage.getItem("backup_key");

if(!backupKey){
return;
}

try{

const total = await restoreBackupFromDrive(backupKey);

if(total > 0){

localStorage.setItem("drive_auto_restored","true");

console.log("Auto restauración completada:", total);

}

}catch(e){

console.log("No se encontró backup en Drive");

}

};