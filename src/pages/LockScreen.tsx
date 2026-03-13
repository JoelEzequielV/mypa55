//src/pages/LockScreen.tsx
import {
  IonPage,
  IonContent,
  IonButton,
  IonText
} from "@ionic/react";

interface Props {
  unlock: () => void;
}

const LockScreen: React.FC<Props> = ({ unlock }) => {

  return (

    <IonPage>

      <IonContent className="ion-padding ion-text-center">
        <br /><br />
        <h2>🔒 App bloqueada</h2>

        <IonButton expand="block" onClick={unlock}>
          Desbloquear
        </IonButton>

      </IonContent>

    </IonPage>

  );

};

export default LockScreen;