import { IonPage,IonContent,IonInput,IonButton } from "@ionic/react";
import { useState } from "react";

interface Props{
 unlock: ()=>void
}

const PinLock:React.FC<Props> = ({unlock}) => {

 const [pin,setPin] = useState("");

 const checkPin = ()=>{

   const saved = localStorage.getItem("masterPin");

   if(!saved){
     localStorage.setItem("masterPin",pin);
     unlock();
     return;
   }

   if(saved === pin){
     unlock();
   }else{
     alert("PIN incorrecto");
   }

 };

 return(

<IonPage>

<IonContent className="ion-padding">

<h2>PIN de seguridad</h2>

<IonInput
 type="password"
 placeholder="PIN"
 value={pin}
 onIonChange={(e)=>setPin(e.detail.value!)}
/>

<IonButton expand="block" onClick={checkPin}>
Entrar
</IonButton>

</IonContent>

</IonPage>

 );

};

export default PinLock;