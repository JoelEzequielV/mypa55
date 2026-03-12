//src/utils/securityAudit.ts

import { checkPasswordStrength } from "./passwordStrength"
import { checkPwnedPassword } from "./pwnedPassword"

export const auditVault = async (passwords:any[])=>{

let weak = 0
let reused = 0
let pwned = 0

const map = new Map()

for(const item of passwords){

const strength = checkPasswordStrength(item.password)

if(strength.level < 0.4){
weak++
}

if(map.has(item.password)){
reused++
}else{
map.set(item.password,true)
}

const check = await checkPwnedPassword(item.password)

if(check.pwned){
pwned++
}

}

return{
weak,
reused,
pwned,
total:passwords.length
}

}