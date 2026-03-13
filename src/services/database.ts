//src/services/database.ts
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from "@capacitor/core";
import { encryptPassword, decryptPassword } from "../utils/encryption";
import { scheduleAutoBackup } from "./autoBackup";

class DatabaseService {

private sqlite: SQLiteConnection;
private db: SQLiteDBConnection | null = null;

constructor(){
this.sqlite = new SQLiteConnection(CapacitorSQLite);
}

async initDB(){

if(Capacitor.getPlatform()==="web") return;

if(this.db) return;

this.db = await this.sqlite.createConnection(
"passwordsDB",
false,
"no-encryption",
1,
false
);

await this.db.open();

await this.db.execute(`
CREATE TABLE IF NOT EXISTS passwords (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT,
username TEXT,
password TEXT
);
`);

await this.db.execute(`
CREATE TABLE IF NOT EXISTS settings (
id INTEGER PRIMARY KEY,
master_password TEXT,
security_question TEXT,
security_answer TEXT
);
`);

}

/* -----------------------------
MASTER PASSWORD
----------------------------- */

async setMasterPassword(hash:string){

if(Capacitor.getPlatform()==="web"){

localStorage.setItem("master_password",hash);
return;

}

if(!this.db) return;

await this.db.run(`
INSERT OR REPLACE INTO settings
(id, master_password)
VALUES (1, ?)
`,[hash]);

}

async getMasterPassword(){

if(Capacitor.getPlatform()==="web"){

return localStorage.getItem("master_password");

}

if(!this.db) return null;

const result = await this.db.query(`
SELECT master_password FROM settings WHERE id=1
`);

if(result.values?.length){

return result.values[0].master_password;

}

return null;

}

/* -----------------------------
SECURITY QUESTION
----------------------------- */

async setSecurityQuestion(question:string,answer:string){

if(Capacitor.getPlatform()==="web"){

localStorage.setItem("security_question",question);
localStorage.setItem("security_answer",answer);

return;

}

if(!this.db) return;

await this.db.run(`
INSERT OR REPLACE INTO settings
(id, security_question, security_answer)
VALUES (1, ?, ?)
`,[question,answer]);

}

async getSecurityQuestion(){

if(Capacitor.getPlatform()==="web"){

return {
question: localStorage.getItem("security_question"),
answer: localStorage.getItem("security_answer")
};

}

if(!this.db) return null;

const result = await this.db.query(`
SELECT security_question, security_answer
FROM settings WHERE id=1
`);

if(result.values?.length){

return result.values[0];

}

return null;

}

/* -----------------------------
DISABLE MASTER PASSWORD
----------------------------- */

async disableMasterPassword(){

if(Capacitor.getPlatform()==="web"){

localStorage.removeItem("master_password");

return;

}

if(!this.db) return;

await this.db.run(`
UPDATE settings
SET master_password=NULL
WHERE id=1
`);

}

/* -----------------------------
PASSWORDS
----------------------------- */

async addPassword(title:string,username:string,password:string,key:string){

if(Capacitor.getPlatform()==="web"){

const encrypted = encryptPassword(password,key);

const data = JSON.parse(localStorage.getItem("passwords") || "[]");

data.push({
id:Date.now(),
title,
username,
password:encrypted
});

localStorage.setItem("passwords",JSON.stringify(data));

return;

}

if(!this.db) return;

const encrypted = encryptPassword(password,key);

await this.db.run(
`INSERT INTO passwords (title,username,password) VALUES (?,?,?)`,
[title,username,encrypted]
);

/* AUTO BACKUP */

const backupKey = localStorage.getItem("backup_key");

if(backupKey){
scheduleAutoBackup(backupKey);
}

}

/* -----------------------------
UPDATE PASSWORDS
----------------------------- */

async updatePassword(id:number,title:string,username:string,password:string,key:string){

if(Capacitor.getPlatform()==="web"){

const data = JSON.parse(localStorage.getItem("passwords") || "[]");

const encrypted = encryptPassword(password,key);

const updated = data.map((p:any)=>{

if(p.id===id){

return {
...p,
title,
username,
password:encrypted
}

}

return p

})

localStorage.setItem("passwords",JSON.stringify(updated));

return;

}

if(!this.db) return;

const encrypted = encryptPassword(password,key);

await this.db.run(
`UPDATE passwords SET title=?, username=?, password=? WHERE id=?`,
[title,username,encrypted,id]
)

/* AUTO BACKUP */

const backupKey = localStorage.getItem("backup_key");

if(backupKey){
scheduleAutoBackup(backupKey);
}

}

/* -----------------------------
GET PASSWORDS
----------------------------- */

async getPasswords(key:string){

if(Capacitor.getPlatform()==="web"){

const data = JSON.parse(localStorage.getItem("passwords") || "[]");

return data.map((p:any)=>{

try{
p.password = decryptPassword(p.password,key);
}catch{
p.password = "ERROR";
}

return p;

});

}

if(!this.db) return [];

const result = await this.db.query(`SELECT * FROM passwords`);

const passwords = result.values || [];

return passwords.map((p:any)=>{

try{
p.password = decryptPassword(p.password,key);
}catch{
p.password = "ERROR";
}

return p;

});

}

async deletePassword(id:number){

if(Capacitor.getPlatform()==="web"){

const data = JSON.parse(localStorage.getItem("passwords") || "[]");

const filtered = data.filter((p:any)=>p.id !== id);

localStorage.setItem("passwords",JSON.stringify(filtered));

return;

}

if(!this.db) return;

await this.db.run(`DELETE FROM passwords WHERE id=?`,[id]);

/* AUTO BACKUP */

const backupKey = localStorage.getItem("backup_key");

if(backupKey){
scheduleAutoBackup(backupKey);
}

}

}

export const databaseService = new DatabaseService();