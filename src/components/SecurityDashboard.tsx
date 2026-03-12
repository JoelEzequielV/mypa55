//src/components/SecurityDashboard.tsx

import { useEffect,useState } from "react"

import {
IonCard,
IonCardHeader,
IonCardTitle,
IonCardContent,
IonProgressBar,
IonText
} from "@ionic/react"

import { auditVault } from "../utils/securityAudit"

interface Props{
passwords:any[]
}

const SecurityDashboard:React.FC<Props> = ({passwords})=>{

const [data,setData] = useState<any>(null)

useEffect(()=>{

runAudit()

},[passwords])

const runAudit = async ()=>{

const result = await auditVault(passwords)

setData(result)

}

if(!data) return null

const score = 1 - ((data.weak + data.reused + data.pwned) / (data.total || 1))

return(

<IonCard>

<IonCardHeader>
<IonCardTitle>Estado de seguridad</IonCardTitle>
</IonCardHeader>

<IonCardContent>

<IonProgressBar value={score}></IonProgressBar>

<br/>

<IonText color="danger">
<p>Contraseñas débiles: {data.weak}</p>
</IonText>

<IonText color="warning">
<p>Reutilizadas: {data.reused}</p>
</IonText>

<IonText color="danger">
<p>Filtradas en internet: {data.pwned}</p>
</IonText>

<IonText>
<p>Total guardadas: {data.total}</p>
</IonText>

</IonCardContent>

</IonCard>

)

}

export default SecurityDashboard