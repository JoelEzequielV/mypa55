//src/services/biometricService.ts

import { Capacitor } from "@capacitor/core";

class BiometricService {

private plugin:any = null;

/* -------------------------
CARGAR PLUGIN
------------------------- */

async load(){

if(Capacitor.getPlatform() === "web") return false;

if(!this.plugin){

const mod = await import("@aparajita/capacitor-biometric-auth");

this.plugin = mod.BiometricAuth;

}

return true;

}

/* -------------------------
DISPONIBLE
------------------------- */

async isAvailable(){

const ok = await this.load();

if(!ok) return false;

try{

const result = await this.plugin.isAvailable();

return result.available;

}catch{

return false;

}

}

/* -------------------------
AUTENTICAR
------------------------- */

async authenticate(){

const ok = await this.load();

if(!ok) return false;

try{

await this.plugin.authenticate({

reason:"Desbloquear bóveda",
title:"Autenticación requerida",
subtitle:"Usa tu huella o FaceID",
cancelTitle:"Cancelar"

});

return true;

}catch{

return false;

}

}

/* -------------------------
GUARDAR CLAVE SEGURA
------------------------- */

async storeKey(key:string){

localStorage.setItem("vault_biometric_key",key);

}

/* -------------------------
RECUPERAR CLAVE
------------------------- */

async getKey(){

return localStorage.getItem("vault_biometric_key");

}

}

export const biometricService = new BiometricService();