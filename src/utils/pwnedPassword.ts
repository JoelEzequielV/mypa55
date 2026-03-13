//src/utils/pwnedPassword.ts
import CryptoJS from "crypto-js";

export const checkPwnedPassword = async (password:string):Promise<boolean> => {

try{

if(!password || password.length < 6) return false

// generar hash SHA1
const hash = CryptoJS.SHA1(password)
.toString(CryptoJS.enc.Hex)
.toUpperCase()

// dividir hash
const prefix = hash.substring(0,5)
const suffix = hash.substring(5)

// consultar API
const res = await fetch(
`https://api.pwnedpasswords.com/range/${prefix}`
)

const text = await res.text()

const lines = text.split("\n")

for(const line of lines){

const parts = line.split(":")

if(parts[0] === suffix){
return true
}

}

return false

}catch(e){

console.warn("Pwned check error",e)
return false

}

}