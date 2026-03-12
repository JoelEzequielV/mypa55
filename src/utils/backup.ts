//src/utils/backup.ts

import CryptoJS from "crypto-js";
import { databaseService } from "../services/database";

/* -------------------------------------------------
EXPORT BACKUP
------------------------------------------------- */

export const exportEncryptedBackup = async (backupPassword:string)=>{

if(!backupPassword || backupPassword.length < 4){
throw new Error("Debes escribir una clave de backup");
}

const key = sessionStorage.getItem("vaultKey");

if(!key){
throw new Error("VaultKey no encontrada");
}

const passwords = await databaseService.getPasswords(key);

const metadata = {
version:1,
created:new Date().toISOString(),
count:passwords.length,
app:"SecureVault"
};

const data = {
metadata,
passwords
};

const json = JSON.stringify(data);

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

/* checksum integridad */

const checksum = CryptoJS.SHA256(json).toString();

/* estructura final */

const backup = {
version:1,
salt,
checksum,
data:encrypted
};

/* nombre archivo */

const date = new Date().toISOString().split("T")[0];

const filename = `securevault-backup-${date}.vault`;

const blob = new Blob(
[JSON.stringify(backup)],
{type:"application/json"}
);

/* descargar */

const url = URL.createObjectURL(blob);

const a = document.createElement("a");

a.href = url;
a.download = filename;

document.body.appendChild(a);

a.click();

document.body.removeChild(a);

URL.revokeObjectURL(url);

return filename;

};



/* -------------------------------------------------
PREVIEW BACKUP
lee metadata sin restaurar
------------------------------------------------- */

export const previewEncryptedBackup = async (
file:File,
backupPassword:string
)=>{

const text = await file.text();

let backup:any;

try{
backup = JSON.parse(text);
}catch{
throw new Error("Archivo de backup inválido");
}

if(!backup.salt || !backup.data){
throw new Error("Formato de backup incorrecto");
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

/* descifrar */

const decrypted = CryptoJS.AES.decrypt(
backup.data,
derivedKey
);

const json = decrypted.toString(CryptoJS.enc.Utf8);

if(!json){
throw new Error("Clave incorrecta");
}

let data:any;

try{
data = JSON.parse(json);
}catch{
throw new Error("Backup corrupto");
}

if(!data.passwords){
throw new Error("Backup inválido");
}

/* validar checksum */

const checksum = CryptoJS.SHA256(JSON.stringify(data)).toString();

return {
count:data.passwords.length,
metadata:data.metadata || {},
data
};

};



/* -------------------------------------------------
IMPORT BACKUP
------------------------------------------------- */

export const importEncryptedBackup = async (
data:any,
progressCallback?:(p:number)=>void
)=>{

if(!data.passwords){
throw new Error("Backup inválido");
}

const key = sessionStorage.getItem("vaultKey");

if(!key){
throw new Error("Sesión no válida");
}

const total = data.passwords.length;

let i = 0;

for(const p of data.passwords){

await databaseService.addPassword(
p.title,
p.username,
p.password,
key
);

i++;

if(progressCallback){

progressCallback(i/total);

}

}

return total;

};