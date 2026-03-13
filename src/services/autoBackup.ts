//src/services/autoBackup.ts

import { uploadBackupToDrive } from "./gdriveBackup";

let backupTimer:any = null;

/*
programar backup automático
*/

export const scheduleAutoBackup = (backupPassword:string) => {

  if(!backupPassword){
    return;
  }

  /* cancelar backup anterior */

  if(backupTimer){
    clearTimeout(backupTimer);
  }

  /* esperar unos segundos */

  backupTimer = setTimeout(async ()=>{

    try{

      console.log("Ejecutando auto backup...");

      await uploadBackupToDrive(backupPassword);

      console.log("Auto backup completado");

    }catch(e){

      console.log("Error auto backup",e);

    }

  },8000);

};