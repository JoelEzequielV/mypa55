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
  goRegister: ()=>void
  goHome: ()=>void
}

const Login: React.FC<Props> = ({goRegister,goHome}) => {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const [showPassword,setShowPassword] = useState(false);

  const login = () => {

    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const user = users.find(
      (u:any)=> u.email === email && u.password === password
    );

    if(!user){
      alert("Credenciales incorrectas");
      return;
    }

    localStorage.setItem("session", JSON.stringify(user));

    alert("Login correcto");

    goHome();

  };

  return (
    <IonPage>

      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <IonItem>
          <IonInput
            placeholder="Email"
            value={email}
            clearOnEdit={false}
            onIonInput={(e:any)=>setEmail(e.detail.value!)}
          />
        </IonItem>

        <IonItem>

          <IonInput
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            clearOnEdit={false}
            onIonInput={(e:any)=>setPassword(e.detail.value!)}
          />

          <IonButton
            fill="clear"
            onClick={()=>setShowPassword(!showPassword)}
          >
            <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
          </IonButton>

        </IonItem>

        <IonButton expand="block" onClick={login}>
          Entrar
        </IonButton>

        <IonButton
          expand="block"
          fill="clear"
          onClick={goRegister}
        >
          Crear cuenta
        </IonButton>

      </IonContent>

    </IonPage>
  );
};

export default Login;