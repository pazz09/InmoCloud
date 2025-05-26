import { handler } from "./handler"

import * as mariadb from 'mariadb';


enum UserRoleEnum {
  Corredor = 'Corredor',
  Propietario = 'Propietario',
  Arrendatario = 'Arrendatario',
  Administrador = 'Administrador'
}

export type user_t = {
  id: number;
  name: string;
  role: UserRoleEnum;
  passwordHash: string;

}


export class Users {
  pool: mariadb.Pool
  constructor() {
    this.pool = handler;
  }

  // Only to be used by admin, must check in higher level.
  public async getUsers(): Promise<user_t[]> {
    const users: user_t[] = [];

    let conn;
    try {
      conn = await this.pool.getConnection();
      const rows = await conn.query("SELECT * FROM users_t");
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        console.log(row)
        const user: user_t = {
          id: row['id'],
          name: row['name'],
          role: row['role'],
          passwordHash: row['passwordHash'],
        };
        users.push(user);
      }
      return users;

    } catch (err) {
      throw err;
    } finally {
      if (conn) conn.end();
    }
  }
}
