//Home.tsx
import { useState,useEffect } from "react";
import "./Home.css";
import { getSiteIcon } from "../utils/siteIcon";
import SecurityDashboard from "../components/SecurityDashboard";
import { checkPwnedPassword } from "../utils/pwnedPassword";

import {
IonCard,
IonCardHeader,
IonCardTitle,
IonCardContent,
IonIcon,
IonToast,
IonPage,
IonHeader,
IonToolbar,
IonTitle,
IonContent,
IonItem,
IonInput,
IonButton,
IonList,
IonSearchbar,
IonProgressBar,
IonText,
IonModal
} from "@ionic/react";

import { eye, eyeOff, star, starOutline, copy, trash, add, create } from 'ionicons/icons';

import { generatePassword } from "../utils/passwordGenerator";
import { checkPasswordStrength } from "../utils/passwordStrength";

import { Clipboard } from "@capacitor/clipboard";

import { databaseService } from "../services/database";

import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";

interface Props{
openSettings:()=>void
}

const ITEMS_PER_PAGE = 8;

const Home:React.FC<Props> = ({openSettings})=>{

const [pwnedTimeout,setPwnedTimeout] = useState<any>(null)
const [search,setSearch] = useState("");
const [showPassword,setShowPassword] = useState(false);

const [site,setSite] = useState("");
const [username,setUsername] = useState("");
const [password,setPassword] = useState("");

const [editingId,setEditingId] = useState<number|null>(null);

const [strength,setStrength] = useState(0);
const [strengthText,setStrengthText] = useState("");

const [pwned,setPwned] = useState(false);

const [showPasswords,setShowPasswords] = useState(false);

const [passwords,setPasswords] = useState<any[]>([]);
const [favorites,setFavorites] = useState<number[]>([]);
const [visiblePasswords,setVisiblePasswords] = useState<number[]>([]);

const [showOnlyFavorites,setShowOnlyFavorites] = useState(false);

const [page,setPage] = useState(1);

const [toastMessage,setToastMessage] = useState("");
const [showToast,setShowToast] = useState(false);

const [showModal,setShowModal] = useState(false);

const isNative = Capacitor.isNativePlatform();

/* -----------------------------
ANALIZAR FUERZA
----------------------------- */

const analyzePassword = (pass:string)=>{

const result = checkPasswordStrength(pass)

setStrength(result.level)
setStrengthText(result.text)

if(pwnedTimeout){
clearTimeout(pwnedTimeout)
}

const timeout = setTimeout(async ()=>{

try{

const compromised = await checkPwnedPassword(pass)
setPwned(compromised)

}catch{

setPwned(false)

}

},800)

setPwnedTimeout(timeout)

}

/* -----------------------------
CARGAR CONTRASEÑAS
----------------------------- */

useEffect(()=>{

loadPasswords();

const savedFavorites = localStorage.getItem("favorites");

if(savedFavorites){
setFavorites(JSON.parse(savedFavorites));
}

},[]);

const loadPasswords = async () => {

const key = sessionStorage.getItem("vaultKey") || "default_key";

try{

const data = await databaseService.getPasswords(key);
setPasswords(data);

if(page > Math.ceil(data.length / ITEMS_PER_PAGE)){
setPage(1)
}

}catch(e){

console.warn("Error cargando contraseñas",e);
setPasswords([]);

}

};

/* -----------------------------
DETECTAR REUTILIZADAS
----------------------------- */

const isReusedPassword = (password:string)=>{

let count = 0

for(const item of passwords){

if(item.password === password){
count++
}

}

return count > 1

}

/* -----------------------------
GUARDAR FAVORITOS
----------------------------- */

useEffect(()=>{

localStorage.setItem(
"favorites",
JSON.stringify(favorites)
);

},[favorites]);

/* -----------------------------
GUARDAR / EDITAR
----------------------------- */

const savePassword = async () => {

if(!site || !username || !password){

setToastMessage("Completa todos los campos");
setShowToast(true);
return;

}

const key = sessionStorage.getItem("vaultKey") || "default_key";

if(editingId){

await databaseService.updatePassword(
editingId,
site,
username,
password,
key
);

setToastMessage("Contraseña actualizada");

}else{

await databaseService.addPassword(
site,
username,
password,
key
);

setToastMessage("Contraseña guardada");

}

await loadPasswords();

setSite("");
setUsername("");
setPassword("");
setEditingId(null)

setShowModal(false)

setShowToast(true);

};

/* -----------------------------
EDITAR
----------------------------- */

const editPassword = (item:any)=>{

setEditingId(item.id)

setSite(item.title)
setUsername(item.username)
setPassword(item.password)

analyzePassword(item.password)

setShowModal(true)

}

/* -----------------------------
ELIMINAR
----------------------------- */

const deletePassword = async (id:number)=>{

if(!window.confirm("¿Eliminar contraseña?")) return;

await databaseService.deletePassword(id);

await loadPasswords();

setToastMessage("Contraseña eliminada");
setShowToast(true);

};

/* -----------------------------
COPIAR
----------------------------- */

const copyPassword = async (password:string)=>{

try {

await Clipboard.write({
string: password
});

} catch {

navigator.clipboard.writeText(password);

setTimeout(()=>{
navigator.clipboard.writeText("");
},60000);

}
navigator.vibrate(50);
setToastMessage("Contraseña copiada, Se borrará del portapapeles en 60 segundos. ");
setShowToast(true);

};

/* -----------------------------
FAVORITOS
----------------------------- */

const toggleFavorite = (id:number)=>{

if(favorites.includes(id)){

setFavorites(favorites.filter(f=>f!==id));

}else{

setFavorites([...favorites,id]);

}

};

/* -----------------------------
MOSTRAR PASSWORD
----------------------------- */

const toggleVisiblePassword = (id:number)=>{

if(visiblePasswords.includes(id)){

setVisiblePasswords(
visiblePasswords.filter(v=>v!==id)
);

}else{

setVisiblePasswords([...visiblePasswords,id]);

}

};

/* -----------------------------
FILTRAR + ORDENAR
----------------------------- */

let filteredPasswords = passwords
.filter((item)=>{

const q = search.toLowerCase();

return (
item.title.toLowerCase().includes(q) ||
item.username.toLowerCase().includes(q)
);

})
.sort((a,b)=>{

const aFav = favorites.includes(a.id);
const bFav = favorites.includes(b.id);

return Number(bFav) - Number(aFav);

})

if(showOnlyFavorites){

filteredPasswords = filteredPasswords.filter(p =>
favorites.includes(p.id)
)

}

/* -----------------------------
PAGINACIÓN
----------------------------- */

const totalPages = Math.max(1, Math.ceil(filteredPasswords.length / ITEMS_PER_PAGE))

const paginated = filteredPasswords.slice(
(page-1)*ITEMS_PER_PAGE,
page*ITEMS_PER_PAGE
)

return(

<IonPage>

<IonHeader>
<IonToolbar>
<IonTitle>Gestor de Contraseñas</IonTitle>
</IonToolbar>
</IonHeader>

<IonContent className="ion-padding">

<IonButton expand="block" color="secondary" onClick={openSettings}>
Configuración
</IonButton>
<br />

<IonButton expand="block" color="primary" onClick={()=>{
setSite("")
setUsername("")
setPassword("")
setEditingId(null)
setPwned(false)
setStrength(0)
setStrengthText("")
setShowModal(true)
}}>
<IonIcon icon={add} slot="start"/>
Nueva contraseña
</IonButton>

<SecurityDashboard passwords={passwords}/>
<h3>Total guardadas: {passwords.length}</h3>

<IonButton expand="block" color="warning" onClick={()=>setShowPasswords(!showPasswords)}>
{showPasswords ? "Ocultar contraseñas":"Mostrar contraseñas"}
</IonButton>

{showPasswords && (

<IonList>

<IonSearchbar
placeholder="Buscar contraseña..."
value={search}
onIonInput={(e)=>setSearch(e.detail.value!)}
/>

<IonButton
expand="block"
color="tertiary"
onClick={()=>{
setShowOnlyFavorites(!showOnlyFavorites)
setPage(1)
}}
>

{showOnlyFavorites
? "Mostrar todas"
: "Mostrar solo favoritos"}

</IonButton>

{paginated.map((item)=>{

const reused = isReusedPassword(item.password)

return(

<IonCard key={item.id}>

<IonCardHeader style={{display:"flex",alignItems:"center",gap:"10px"}}>

<img
src={getSiteIcon(item.title)}
width="24"
height="24"
/>

<IonCardTitle>

{item.title}

<IonButton
fill="clear"
size="small"
onClick={()=>toggleFavorite(item.id)}
>

<IonIcon
icon={
favorites.includes(item.id)
? star
: starOutline
}
/>

</IonButton>

</IonCardTitle>

</IonCardHeader>

<IonCardContent>

<p>
<strong>Usuario:</strong> {item.username}
</p>

<p>
<strong>Contraseña: </strong>
{
visiblePasswords.includes(item.id)
? item.password
: "••••••••"
}
</p>

{reused && (

<IonText color="danger">
<p style={{fontSize:"12px"}}>
⚠️ Contraseña reutilizada
</p>
</IonText>

)}
{checkPasswordStrength(item.password).level < 0.4 && (

<IonText color="warning">
<p style={{fontSize:"12px"}}>
⚠️ Contraseña débil
</p>
</IonText>

)}

<IonButton
color="secondary"
size="small"
onClick={()=>toggleVisiblePassword(item.id)}
>

<IonIcon
icon={
visiblePasswords.includes(item.id)
? eyeOff
: eye
}
/>

</IonButton>

<IonButton
size="small"
onClick={()=>copyPassword(item.password)}
>

<IonIcon icon={copy}/>

</IonButton>

<IonButton
size="small"
color="medium"
onClick={()=>editPassword(item)}
>

<IonIcon icon={create}/>

</IonButton>

<IonButton
size="small"
color="danger"
onClick={()=>deletePassword(item.id)}
>

<IonIcon icon={trash}/>

</IonButton>

</IonCardContent>

</IonCard>

)

})}

<div style={{textAlign:"center"}}>

<IonButton
disabled={page===1}
onClick={()=>setPage(page-1)}
>

Anterior

</IonButton>

<span style={{margin:"0 10px"}}>
Página {page} / {totalPages || 1}
</span>

<IonButton
disabled={page===totalPages}
onClick={()=>setPage(page+1)}
>

Siguiente

</IonButton>

</div>

</IonList>

)}

<IonModal isOpen={showModal} onDidDismiss={()=>setShowModal(false)}>

<IonContent className="ion-padding">

<h2>
{editingId ? "Editar contraseña" : "Nueva contraseña"}
</h2>

<IonItem>
<IonInput
value={site}
clearOnEdit={false}
onIonInput={(e:any)=>setSite(e.detail.value!)}
label="Sitio web"
labelPlacement="floating"
/>
</IonItem>

<IonItem>
<IonInput
value={username}
clearOnEdit={false}
onIonInput={(e:any)=>setUsername(e.detail.value!)}
label="Usuario"
labelPlacement="floating"
/>
</IonItem>

<IonItem>

<IonInput
label="Contraseña"
labelPlacement="floating"
type={showPassword ? "text":"password"}
value={password}
clearOnEdit={false}
onIonInput={(e:any)=>{
const val = e.detail.value!
setPassword(val)
analyzePassword(val)
}}
/>

<IonButton
fill="clear"
slot="end"
onClick={()=>setShowPassword(!showPassword)}
>
<IonIcon icon={showPassword ? eyeOff : eye}/>
</IonButton>

</IonItem>

<IonProgressBar value={strength}></IonProgressBar>

<IonText>
<p style={{fontSize:"12px"}}>
Seguridad: {strengthText}
</p>
</IonText>

{pwned && (
<IonText color="danger">
<p style={{fontSize:"12px"}}>
⚠️ Esta contraseña apareció en filtraciones públicas
</p>
</IonText>
)}

<IonButton
expand="block"
color="warning"
onClick={()=>{

const pass = generatePassword()

setPassword(pass)
analyzePassword(pass)

}}
>
Generar contraseña segura
</IonButton>

<br/>

<IonButton
expand="block"
color="primary"
onClick={savePassword}
>
{editingId ? "Actualizar contraseña" : "Guardar contraseña"}
</IonButton>

<br/>

<IonButton
expand="block"
color="medium"
onClick={()=>{
setShowModal(false)
setEditingId(null)
setPwned(false)
setStrength(0)
setStrengthText("")
}}
>
Cancelar
</IonButton>

</IonContent>

</IonModal>

<IonToast
isOpen={showToast}
message={toastMessage}
duration={1500}
onDidDismiss={()=>setShowToast(false)}
/>
<p><br /><br /></p>
</IonContent>

</IonPage>

);

};

export default Home;