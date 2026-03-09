import { useState,useEffect } from "react";
import "./Home.css";

import {
IonCard,
IonCardHeader,
IonCardTitle,
IonCardContent,
IonIcon,
IonToast
} from '@ionic/react';

import {
IonPage,
IonHeader,
IonToolbar,
IonTitle,
IonContent,
IonItem,
IonInput,
IonButton,
IonList,
IonSearchbar
} from "@ionic/react";

import { eye, eyeOff, star, starOutline, copy, trash } from 'ionicons/icons';

import { encryptPassword, decryptPassword } from "../utils/crypto";
import { generatePassword } from "../utils/passwordGenerator";
import { Clipboard } from "@capacitor/clipboard";

const Home:React.FC = () => {

const [search,setSearch] = useState("");
const [showPassword,setShowPassword] = useState(false);

const [site,setSite] = useState("");
const [username,setUsername] = useState("");
const [password,setPassword] = useState("");

const [showPasswords,setShowPasswords] = useState(false);

const [passwords,setPasswords] = useState<any[]>([]);
const [favorites,setFavorites] = useState<number[]>([]);
const [visiblePasswords,setVisiblePasswords] = useState<number[]>([]);

const [toastMessage,setToastMessage] = useState("");
const [showToast,setShowToast] = useState(false);


useEffect(()=>{

const savedPasswords = localStorage.getItem("passwords");
const savedFavorites = localStorage.getItem("favorites");

if(savedPasswords){
setPasswords(JSON.parse(savedPasswords));
}

if(savedFavorites){
setFavorites(JSON.parse(savedFavorites));
}

},[]);



useEffect(()=>{

localStorage.setItem(
"passwords",
JSON.stringify(passwords)
);

},[passwords]);


useEffect(()=>{

localStorage.setItem(
"favorites",
JSON.stringify(favorites)
);

},[favorites]);



const savePassword = () => {

if(!site || !username || !password){
setToastMessage("Completa todos los campos");
setShowToast(true);
return;
}

const encrypted = encryptPassword(password);

const newPassword = {
id: Date.now(),
title: site,
username: username,
password: encrypted
};

const updated = [...passwords, newPassword];

setPasswords(updated);

setSite("");
setUsername("");
setPassword("");

setToastMessage("Contraseña guardada");
setShowToast(true);

};



const deletePassword = (id:number)=>{

if(!window.confirm("¿Eliminar contraseña?")) return;

const updated = passwords.filter(p=>p.id!==id);

setPasswords(updated);

setToastMessage("Contraseña eliminada");
setShowToast(true);

};



const copyPassword = async (encrypted:string)=>{

const decrypted = decryptPassword(encrypted);

try {

await Clipboard.write({
string: decrypted
});

} catch {

navigator.clipboard.writeText(decrypted);

}

setToastMessage("Contraseña copiada");
setShowToast(true);

};



const toggleFavorite = (id:number)=>{

if(favorites.includes(id)){

setFavorites(favorites.filter(f=>f!==id));

}else{

setFavorites([...favorites,id]);

}

};



const toggleVisiblePassword = (id:number)=>{

if(visiblePasswords.includes(id)){

setVisiblePasswords(
visiblePasswords.filter(v=>v!==id)
);

}else{

setVisiblePasswords([...visiblePasswords,id]);

}

};



const filteredPasswords = passwords
.filter((item)=>
item.title.toLowerCase().includes(search.toLowerCase())
)
.sort((a,b)=>{

const aFav = favorites.includes(a.id);
const bFav = favorites.includes(b.id);

return Number(bFav) - Number(aFav);

});


return(

<IonPage>

<IonHeader>

<IonToolbar>

<IonTitle>Gestor de Contraseñas</IonTitle>

</IonToolbar>

</IonHeader>

<IonContent className="ion-padding">


<IonSearchbar
placeholder="Buscar contraseña..."
value={search}
onIonInput={(e)=>setSearch(e.detail.value!)}
/>


<h3>Total guardadas: {passwords.length}</h3>


<IonItem>

<IonInput
value={site}
onIonChange={e=>setSite(e.detail.value!)}
label="Sitio web o app"
labelPlacement="floating"
placeholder="www.example.com, Steam, Instagram..."
/>

</IonItem>


<IonItem>

<IonInput
value={username}
onIonChange={e=>setUsername(e.detail.value!)}
label="Usuario"
labelPlacement="floating"
placeholder="Tu usuario"
/>

</IonItem>


<IonItem>

<IonInput
label="Contraseña"
labelPlacement="floating"
placeholder="Introduce contraseña"
type={showPassword ? "text":"password"}
value={password}
onIonChange={(e)=>setPassword(e.detail.value!)}
/>

<IonButton
fill="clear"
slot="end"
onClick={()=>setShowPassword(!showPassword)}
>

<IonIcon icon={showPassword ? eyeOff : eye}/>

</IonButton>

</IonItem>


<IonButton
color="warning"
expand="block"
onClick={()=>setPassword(generatePassword())}
>

Generar contraseña segura

</IonButton>


<IonButton
color="success"
expand="block"
onClick={savePassword}
>

Guardar contraseña

</IonButton>


<br />


<IonButton
expand="block"
onClick={()=>setShowPasswords(!showPasswords)}
>

{showPasswords ? "Ocultar contraseñas":"Mostrar contraseñas"}

</IonButton>



{showPasswords && (

<IonList>

{filteredPasswords.map((item)=>(

<IonCard key={item.id}>

<IonCardHeader>

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
? decryptPassword(item.password)
: "••••••••"
}

</p>


<IonButton
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
color="danger"
onClick={()=>deletePassword(item.id)}
>

<IonIcon icon={trash}/>

</IonButton>

</IonCardContent>

</IonCard>

))}

</IonList>

)}



<IonToast
isOpen={showToast}
message={toastMessage}
duration={1500}
onDidDismiss={()=>setShowToast(false)}
/>


</IonContent>

</IonPage>

);

};

export default Home;