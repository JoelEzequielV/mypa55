import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon
} from "@ionic/react";

import { eyeOutline, eyeOffOutline } from "ionicons/icons";

import { useState } from "react";

interface Props{
  goLogin: ()=>void
}

const Register: React.FC<Props> = ({goLogin}) => {

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const [showPassword,setShowPassword] = useState(false);

  const register = () => {

    if(!name.trim() || !email.trim() || !password.trim()){
      alert("Completa todos los campos");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const exist = users.find((u:any)=> u.email === email);

    if(exist){
      alert("El usuario ya existe");
      return;
    }

    users.push({
      name: name.trim(),
      email: email.trim(),
      password: password.trim()
    });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Usuario creado correctamente");

    setName("");
    setEmail("");
    setPassword("");

    goLogin();

  };

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar>
          <IonTitle>Registro</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <IonItem>
          <IonInput
            placeholder="Nombre"
            value={name}
            onIonChange={(e)=>setName(e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonInput
            type="email"
            placeholder="Email"
            value={email}
            onIonChange={(e)=>setEmail(e.detail.value!)}
          />
        </IonItem>

        <IonItem>

          <IonInput
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onIonChange={(e)=>setPassword(e.detail.value!)}
          />

          <IonButton
            fill="clear"
            onClick={()=>setShowPassword(!showPassword)}
          >
            <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline}/>
          </IonButton>

        </IonItem>

        <IonButton expand="block" onClick={register}>
          Crear cuenta
        </IonButton>

        <IonButton
          expand="block"
          fill="clear"
          onClick={goLogin}
        >
          Volver al login
        </IonButton>

      </IonContent>

    </IonPage>
  );
};

export default Register;