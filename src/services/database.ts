import { CapacitorSQLite, SQLiteDBConnection } from '@capacitor-community/sqlite';

class DatabaseService {

private db: SQLiteDBConnection | null = null;

async initDB() {

const sqlite = CapacitorSQLite;

this.db = await sqlite.createConnection(
"passwordsDB",
false,
"no-encryption",
1,
false
);

await this.db.open();

await this.db.execute(`
CREATE TABLE IF NOT EXISTS passwords (
id INTEGER PRIMARY KEY NOT NULL,
title TEXT,
username TEXT,
password TEXT
);
`);

}

async addPassword(title:string, username:string, password:string){

await this.db?.run(
`INSERT INTO passwords (title,username,password) VALUES (?,?,?)`,
[title,username,password]
);

}

async getPasswords(){

const result = await this.db?.query(`SELECT * FROM passwords`);

return result?.values || [];

}

async deletePassword(id:number){

await this.db?.run(
`DELETE FROM passwords WHERE id=?`,
[id]
);

}

}

export const databaseService = new DatabaseService();