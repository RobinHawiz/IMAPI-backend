import { diContainer } from "@fastify/awilix";
import { Database } from "better-sqlite3";
import { UserEntity, UserInfo, UserPayload } from "@models/user.js";

export interface UserRepository {
  // Verifies a users existence. Returns a user for password verification.
  findByUsername(username: string): UserEntity;
  // Returns one user
  findOneUser(id: string): UserInfo;
  // Inserts a user and returns the id
  insertUser(payload: UserPayload): number | bigint;
}

export class SQLiteUserRepository implements UserRepository {
  private readonly db: Database;

  constructor() {
    this.db = diContainer.resolve("db");
  }

  findByUsername(username: string) {
    try {
      return this.db
        .prepare(
          `select id, first_name as firstName, last_name as lastName, username, password_hash as passwordHash from user where username = @username`,
        )
        .get({ username }) as UserEntity;
    } catch (error) {
      console.error("Database user lookup error:", error);
      throw error;
    }
  }

  findOneUser(id: string) {
    return this.db
      .prepare(
        `select first_name as firstName, last_name as lastName, username
           from user
          where id = @id`,
      )
      .get({ id }) as UserInfo;
  }

  insertUser(payload: UserPayload) {
    return this.db
      .prepare(
        `insert into user (first_name, last_name, username, password_hash)
              values(@firstName, @lastName, @username, @password)`,
      )
      .run(payload).lastInsertRowid;
  }
}
