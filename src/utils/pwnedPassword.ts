//src/utils/pwnedPassword.ts

import CryptoJS from "crypto-js";

/*
Verifica si una contraseña fue filtrada usando
la API de HaveIBeenPwned con método k-Anonymity
*/

export const checkPwnedPassword = async (password:string)=>{

const sha1 = CryptoJS.SHA1(password).toString().toUpperCase()

const prefix = sha1.substring(0,5)
const suffix = sha1.substring(5)

try{

const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)

const text = await res.text()

const lines = text.split("\n")

for(const line of lines){

const [hash,count] = line.trim().split(":")

if(hash === suffix){

return {
pwned:true,
count:parseInt(count)
}

}

}

return {pwned:false,count:0}

}catch{

return {pwned:false,count:0}

}

}