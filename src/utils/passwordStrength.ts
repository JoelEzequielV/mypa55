//src/utils/passwordStrength.ts
export interface PasswordStrengthResult{
    score:number
    level:number
    text:string
    color:string
    }
    
    /* --------------------------------
    LISTA DE CONTRASEÑAS COMUNES
    -------------------------------- */
    
    const commonPasswords = [
    "123456",
    "password",
    "12345678",
    "qwerty",
    "12345",
    "123456789",
    "1234567",
    "111111",
    "123123",
    "abc123",
    "password123"
    ]
    
    /* --------------------------------
    ANALIZAR FUERZA DE CONTRASEÑA
    -------------------------------- */
    
    export const checkPasswordStrength = (password:string):PasswordStrengthResult=>{
    
    let score = 0
    let text = "Muy débil"
    let color = "danger"
    
    /* longitud */
    
    if(password.length >= 8) score++
    if(password.length >= 12) score++
    
    /* complejidad */
    
    if(/[A-Z]/.test(password)) score++
    if(/[a-z]/.test(password)) score++
    if(/[0-9]/.test(password)) score++
    if(/[^A-Za-z0-9]/.test(password)) score++
    
    /* contraseñas comunes */
    
    if(commonPasswords.includes(password.toLowerCase())){
    score = 0
    }
    
    const level = score / 6
    
    /* determinar texto */
    
    if(level <= 0.2){
    text="Muy débil"
    color="danger"
    }
    else if(level <= 0.4){
    text="Débil"
    color="warning"
    }
    else if(level <= 0.6){
    text="Aceptable"
    color="warning"
    }
    else if(level <= 0.8){
    text="Fuerte"
    color="success"
    }
    else{
    text="Muy fuerte"
    color="success"
    }
    
    return{
    score,
    level,
    text,
    color
    }
    
    }
    
    /* --------------------------------
    VALIDAR CONTRASEÑA MAESTRA
    -------------------------------- */
    
    export const validateMasterPassword = (password:string)=>{
    
    if(password.length < 8){
    
    return "La contraseña debe tener al menos 8 caracteres"
    
    }
    
    if(!/[A-Z]/.test(password)){
    
    return "Debe incluir al menos una letra mayúscula"
    
    }
    
    if(!/[0-9]/.test(password)){
    
    return "Debe incluir al menos un número"
    
    }
    
    if(!/[^A-Za-z0-9]/.test(password)){
    
    return "Debe incluir al menos un símbolo"
    
    }
    
    return null
    
    }