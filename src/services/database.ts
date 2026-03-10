//database.ts
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from "@capacitor/core";

class DatabaseService {

  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initDB() {

    if (Capacitor.getPlatform() === "web") {
      return;
    }

    if (this.db) return;

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
        use_master_password INTEGER,
        master_password TEXT,
        security_question TEXT,
        security_answer TEXT
      );
    `);

  }

  /* -----------------------------
  MASTER PASSWORD
  ----------------------------- */

  async setMasterPassword(hash: string) {

    if (Capacitor.getPlatform() === "web") {

      localStorage.setItem("master_password", hash);
      localStorage.setItem("use_master_password", "true");

      return;
    }

    if (!this.db) return;

    await this.db.run(
      `INSERT OR REPLACE INTO settings
      (id,use_master_password,master_password)
      VALUES (1,1,?)`,
      [hash]
    );

  }

  async getMasterPassword() {

    if (Capacitor.getPlatform() === "web") {
      return localStorage.getItem("master_password");
    }

    if (!this.db) return null;

    const result = await this.db.query(
      `SELECT master_password FROM settings WHERE id = 1`
    );

    return result.values?.[0]?.master_password || null;

  }

  async useMasterPassword() {

    if (Capacitor.getPlatform() === "web") {

      return localStorage.getItem("use_master_password") === "true";

    }

    if (!this.db) return false;

    const result = await this.db.query(
      `SELECT use_master_password FROM settings WHERE id=1`
    );

    return result.values?.[0]?.use_master_password === 1;

  }

  async disableMasterPassword() {

    if (Capacitor.getPlatform() === "web") {

      localStorage.setItem("use_master_password","false");

      return;
    }

    if (!this.db) return;

    await this.db.run(
      `UPDATE settings SET use_master_password=0 WHERE id=1`
    );

  }

  /* -----------------------------
  SECURITY QUESTION
  ----------------------------- */

  async setSecurityQuestion(question:string, answer:string){

    if (Capacitor.getPlatform() === "web"){

      localStorage.setItem("security_question",question);
      localStorage.setItem("security_answer",answer);

      return;
    }

    if (!this.db) return;

    await this.db.run(
      `UPDATE settings
       SET security_question=?, security_answer=?
       WHERE id=1`,
       [question,answer]
    );

  }

  async getSecurityQuestion(){

    if (Capacitor.getPlatform() === "web"){
      return localStorage.getItem("security_question");
    }

    if (!this.db) return null;

    const result = await this.db.query(
      `SELECT security_question FROM settings WHERE id=1`
    );

    return result.values?.[0]?.security_question || null;

  }

  async verifySecurityAnswer(answer:string){

    if (Capacitor.getPlatform() === "web"){

      const saved = localStorage.getItem("security_answer");

      return saved === answer;

    }

    if (!this.db) return false;

    const result = await this.db.query(
      `SELECT security_answer FROM settings WHERE id=1`
    );

    return result.values?.[0]?.security_answer === answer;

  }

  /* -----------------------------
  RESET APP
  ----------------------------- */

  async resetApp(){

    if (Capacitor.getPlatform() === "web"){

      localStorage.clear();

      return;

    }

    if (!this.db) return;

    await this.db.execute(`DELETE FROM passwords`);
    await this.db.execute(`DELETE FROM settings`);

  }

  /* -----------------------------
  PASSWORDS
  ----------------------------- */

  async addPassword(title: string, username: string, password: string) {

    if (Capacitor.getPlatform() === "web") return;

    if (!this.db) return;

    await this.db.run(
      `INSERT INTO passwords (title,username,password) VALUES (?,?,?)`,
      [title, username, password]
    );

  }

  async getPasswords() {

    if (Capacitor.getPlatform() === "web") return [];

    if (!this.db) return [];

    const result = await this.db.query(`SELECT * FROM passwords`);

    return result.values || [];

  }

  async deletePassword(id: number) {

    if (Capacitor.getPlatform() === "web") return;

    if (!this.db) return;

    await this.db.run(
      `DELETE FROM passwords WHERE id=?`,
      [id]
    );

  }

}

export const databaseService = new DatabaseService();