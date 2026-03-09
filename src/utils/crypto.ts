import CryptoJS from "crypto-js";

const SECRET_KEY = "mi_clave_super_secreta";

export const encryptPassword = (password:string) => {

  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();

};

export const decryptPassword = (encrypted:string) => {

  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);

  return bytes.toString(CryptoJS.enc.Utf8);

};