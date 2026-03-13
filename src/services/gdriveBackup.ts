//src/services/gdriveBackup.ts

import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { databaseService } from "./database";
import CryptoJS from "crypto-js";

/* ------------------------------------------------
OBTENER TOKEN GOOGLE
------------------------------------------------ */

const getGoogleToken = async () => {

  const user = await GoogleAuth.signIn();

  if(!user || !user.authentication?.accessToken){
    throw new Error("No se pudo autenticar con Google");
  }

  return user.authentication.accessToken;

};

/* ------------------------------------------------
BUSCAR O CREAR CARPETA
------------------------------------------------ */

const getOrCreateFolder = async (token:string) => {

  const folderName = "SecureVault";

  const search = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    {
      headers:{
        Authorization:`Bearer ${token}`
      }
    }
  );

  const result = await search.json();

  if(result.files && result.files.length){
    return result.files[0].id;
  }

  /* crear carpeta */

  const create = await fetch(
    "https://www.googleapis.com/drive/v3/files",
    {
      method:"POST",
      headers:{
        Authorization:`Bearer ${token}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        name:folderName,
        mimeType:"application/vnd.google-apps.folder"
      })
    }
  );

  const folder = await create.json();

  return folder.id;

};

/* ------------------------------------------------
BUSCAR BACKUP EXISTENTE
------------------------------------------------ */

const findBackupFile = async (token:string,folderId:string) => {

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='auto-backup.vault' and '${folderId}' in parents and trashed=false`,
    {
      headers:{
        Authorization:`Bearer ${token}`
      }
    }
  );

  const data = await res.json();

  if(data.files && data.files.length){
    return data.files[0].id;
  }

  return null;

};

/* ------------------------------------------------
DESCARGAR BACKUP DESDE DRIVE
------------------------------------------------ */

export const downloadBackupFromDrive = async (backupPassword:string)=>{

const token = await getGoogleToken();

/* buscar carpeta */

const folderId = await getOrCreateFolder(token);

/* buscar archivo */

const fileId = await findBackupFile(token,folderId);

if(!fileId){
throw new Error("No se encontró backup en Google Drive");
}

/* descargar archivo */

const res = await fetch(
`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

const text = await res.text();

let backup:any;

try{
backup = JSON.parse(text);
}catch{
throw new Error("Backup corrupto");
}

/* derivar clave */

const derivedKey = CryptoJS.PBKDF2(
backupPassword,
backup.salt,
{
keySize:256/32,
iterations:100000
}
).toString();

/* ------------------------------------------------
VERIFICAR HMAC (si existe)
protección contra manipulación
------------------------------------------------ */

if(backup.hmac){

const verify = CryptoJS.HmacSHA256(
backup.data,
derivedKey
).toString();

if(verify !== backup.hmac){
throw new Error("Backup manipulado o corrupto");
}

}

/* descifrar */

const decrypted = CryptoJS.AES.decrypt(
backup.data,
derivedKey
);

const json = decrypted.toString(CryptoJS.enc.Utf8);

if(!json){
throw new Error("Clave incorrecta");
}

const data = JSON.parse(json);

if(!data.passwords){
throw new Error("Backup inválido");
}

return data.passwords;

};

/* ------------------------------------------------
RESTAURAR BACKUP
------------------------------------------------ */

export const restoreBackupFromDrive = async (backupPassword:string)=>{

const key = sessionStorage.getItem("vaultKey");

if(!key){
throw new Error("Sesión no válida");
}

const passwords = await downloadBackupFromDrive(backupPassword);

let total = 0;

for(const p of passwords){

await databaseService.addPassword(
p.title,
p.username,
p.password,
key
);

total++;

}

return total;

};

/* ------------------------------------------------
SUBIR BACKUP
------------------------------------------------ */

export const uploadBackupToDrive = async (backupPassword:string) => {

  if(!backupPassword){
    throw new Error("Debes ingresar la clave de backup");
  }

  const token = await getGoogleToken();

  const key = sessionStorage.getItem("vaultKey");

  if(!key){
    throw new Error("VaultKey no encontrada");
  }

  const passwords = await databaseService.getPasswords(key);

  const json = JSON.stringify({
    version:1,
    created:new Date().toISOString(),
    passwords
  });

  /* salt */

  const salt = CryptoJS.lib.WordArray.random(128/8).toString();

  /* derivar clave */

  const derivedKey = CryptoJS.PBKDF2(
    backupPassword,
    salt,
    {
      keySize:256/32,
      iterations:100000
    }
  ).toString();

  /* cifrar */

  const encrypted = CryptoJS.AES.encrypt(
    json,
    derivedKey
  ).toString();

  /* ------------------------------------------------
  HMAC de integridad
  ------------------------------------------------ */

  const hmac = CryptoJS.HmacSHA256(
    encrypted,
    derivedKey
  ).toString();

  const backup = {
    version:1,
    salt,
    hmac,
    data:encrypted
  };

  const blob = new Blob(
    [JSON.stringify(backup)],
    {type:"application/json"}
  );

  /* carpeta */

  const folderId = await getOrCreateFolder(token);

  /* buscar backup */

  const existingFile = await findBackupFile(token,folderId);

  /* metadata */

  const metadata = existingFile
    ? {}
    : {
        name:"auto-backup.vault",
        parents:[folderId]
      };

  /* form */

  const form = new FormData();

  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)],{type:"application/json"})
  );

  form.append("file",blob);

  /* url */

  const uploadUrl = existingFile
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFile}?uploadType=multipart`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

  const res = await fetch(
    uploadUrl,
    {
      method: existingFile ? "PATCH" : "POST",
      headers:{
        Authorization:`Bearer ${token}`
      },
      body:form
    }
  );

  const data = await res.json();

  return data;

};

  //verifica si existe el backup en Google Drive.

  export const backupExistsOnDrive = async () => {

    try{
  
      const token = await getGoogleToken();
  
      const folderId = await getOrCreateFolder(token);
  
      const fileId = await findBackupFile(token,folderId);
  
      return !!fileId;
  
    }catch{
  
      return false;
  
    }
  
  };