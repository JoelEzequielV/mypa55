//passwordGenerator.ts
export const generatePassword = (
  length=16,
  useUpper=true,
  useLower=true,
  useNumbers=true,
  useSymbols=true
  )=>{
  
  let chars="";
  
  if(useLower) chars+="abcdefghijklmnopqrstuvwxyz";
  if(useUpper) chars+="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if(useNumbers) chars+="0123456789";
  if(useSymbols) chars+="!@#$%&*()_+-=";
  
  if(chars.length===0){
  chars="abcdefghijklmnopqrstuvwxyz";
  }
  
  let password="";
  
  for(let i=0;i<length;i++){
  
  password += chars.charAt(
  Math.floor(Math.random()*chars.length)
  );
  
  }
  
  return password;
  
  };