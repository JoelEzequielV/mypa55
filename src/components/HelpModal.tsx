import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    IonText
    } from "@ionic/react";
    
    interface Props{
    isOpen:boolean
    onClose:()=>void
    }
    
    const HelpModal:React.FC<Props> = ({isOpen,onClose})=>{
    
    return(
    
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
    
    <IonHeader>
    <IonToolbar>
    <IonTitle>Guía de uso y seguridad</IonTitle>
    </IonToolbar>
    </IonHeader>
    
    <IonContent className="ion-padding">
    
    <IonAccordionGroup>
    
    {/* INTRO */}
    
    <IonAccordion value="intro">
    <IonItem slot="header">
    <IonLabel>¿Qué es esta app?</IonLabel>
    </IonItem>
    
    <div className="ion-padding" slot="content">
    
    <IonText>
    
    <p>
    
    Esta aplicación es un gestor de contraseñas seguro que permite almacenar
    tus credenciales de forma cifrada en tu dispositivo.
    
    Todas las contraseñas se protegen mediante cifrado fuerte antes de ser
    guardadas.
    
    </p>
    
    </IonText>
    
    </div>
    </IonAccordion>
    
    {/* SEGURIDAD */}
    
    <IonAccordion value="security">
    <IonItem slot="header">
    <IonLabel>¿Cómo se protegen mis contraseñas?</IonLabel>
    </IonItem>
    
    <div className="ion-padding" slot="content">
    
    <ul>
    
    <li>Todas las contraseñas se cifran localmente con AES.</li>
    <li>La clave se deriva de tu contraseña maestra.</li>
    <li>El desarrollador no puede ver tus datos.</li>
    <li>Los datos nunca se envían a servidores externos.</li>
    
    </ul>
    
    </div>
    </IonAccordion>

    
    {/* MASTER PASSWORD */}
    
    <IonAccordion value="master">
    <IonItem slot="header">
    <IonLabel>¿Qué es la contraseña maestra?</IonLabel>
    </IonItem>
    
    <div className="ion-padding" slot="content">
    
    <p>
    
    La contraseña maestra desbloquea tu bóveda segura.
    Es la única forma de acceder a tus contraseñas.
    
    No se puede recuperar si la olvidas, por lo que debes guardarla en un
    lugar seguro.
    
    </p>
    
    </div>
    </IonAccordion>
    
    {/* BACKUP */}
    
    <IonAccordion value="backup">
    <IonItem slot="header">
    <IonLabel>Backups automáticos</IonLabel>
    </IonItem>
    
    <div className="ion-padding" slot="content">
    
    <p>
    
    La aplicación puede crear copias de seguridad cifradas en tu cuenta
    de Google Drive.
    
    Estas copias están protegidas mediante cifrado antes de ser enviadas.
    
    Solo tú puedes restaurarlas usando tu clave de backup.
    
    </p>
    
    </div>
    </IonAccordion>

    {/* Información criptográfica */}

    <IonAccordion value="infocrypt">
    <IonItem slot="header">
    <IonLabel>Información criptográfica</IonLabel>
    </IonItem>
    
    <div className="ion-padding" slot="content">
    
    <ul style={{color:"green"}}>
    
    <li>Algoritmo de cifrado: AES-256</li>
    <li>Derivación de clave: PBKDF2</li>
    <li>Iteraciones: 100000</li>
    <li>Integridad: HMAC-SHA256</li>
    <li>Almacenamiento: bóveda cifrada local</li>
    </ul>
    
    </div>
    </IonAccordion>
    
    {/* PRIVACY */}
    
    <IonAccordion value="privacy">
    <IonItem slot="header">
    <IonLabel>Privacidad</IonLabel>
    </IonItem>
    
    <div className="ion-padding" slot="content">
    
    <p style={{color:"red"}}>
    
    Esta aplicación no recopila información personal ni envía tus
    contraseñas a servidores.
    
    Toda la información se almacena cifrada en tu dispositivo.
    </p>
    <p>
    Esta aplicación es un gestor de contraseñas que almacena la información
    de forma cifrada en el dispositivo del usuario.

    Las contraseñas nunca se envían a servidores externos.

    Opcionalmente el usuario puede crear copias de seguridad cifradas
    en su cuenta personal de Google Drive.

    El desarrollador no tiene acceso a las contraseñas ni a los backups.

    La aplicación no recopila datos personales.
    </p>
    <a href="#" target="_blank" rel="noopener noreferrer" style={{textAlign: "center"}}>ver mas</a>
    </div>
    </IonAccordion>
    
    </IonAccordionGroup>
    
    <br/>

    <IonButton expand="block" onClick={onClose}>
    Cerrar
    </IonButton>
    
    </IonContent>
    
    </IonModal>
    
    );
    
    };
    
    export default HelpModal;