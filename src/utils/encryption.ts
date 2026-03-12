//src/services/encryption.ts
import CryptoJS from "crypto-js";

/* -----------------------------
GENERAR SALT
----------------------------- */

export const generateSalt = () => {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
};

/* -----------------------------
DERIVAR CLAVE CON PBKDF2
----------------------------- */

export const deriveKey = (password: string, salt: string) => {

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 100000
  });

  return key.toString();

};

/* -----------------------------
ENCRYPT
----------------------------- */

export const encryptPassword = (password: string, key: string) => {

  const encrypted = CryptoJS.AES.encrypt(password, key).toString();

  return encrypted;

};

/* -----------------------------
DECRYPT
----------------------------- */

export const decryptPassword = (encrypted: string, key: string) => {

  const bytes = CryptoJS.AES.decrypt(encrypted, key);

  return bytes.toString(CryptoJS.enc.Utf8);

};