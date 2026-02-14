import { diContainer } from "@fastify/awilix";
import { UserCredentials, UserInfo, UserPayload } from "@models/user.js";
import { DomainError } from "@errors/domainError.js";
import { UserRepository } from "@repositories/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface UserService {
  /**
   * Attempts to authenticate a user.
   *
   * @returns JWT string on successful login.
   * @throws DomainError on failure.
   */
  loginUser(payload: UserCredentials): Promise<string>;
  // Returns the current user or throws DomainError("User not found")
  getUser(id: string): UserInfo;
  // Inserts and returns a new id
  insertUser(userPayload: UserPayload): Promise<number | bigint>;
}

export class DefaultUserService implements UserService {
  private readonly repo: UserRepository;

  constructor() {
    this.repo = diContainer.resolve("userRepo");
  }

  async loginUser(payload: UserPayload) {
    const user = this.repo.findByUsername(payload.username);
    if (!user) {
      throw new DomainError(`Username or password is incorrect`);
    }

    const passwordMatch = await bcrypt.compare(
      payload.password,
      user.passwordHash,
    );
    if (!passwordMatch) {
      throw new DomainError(`Username or password is incorrect`);
    }

    // Create JWT
    const token: string = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET_KEY as string,
      {
        expiresIn: "1h",
      },
    );
    return token;
  }

  getUser(id: string) {
    const user = this.repo.findOneUser(id);
    if (!user) {
      throw new DomainError(`User not found`);
    }
    return user;
  }

  async insertUser(payload: UserPayload) {
    const user = this.repo.findByUsername(payload.username);
    if (user) {
      throw new DomainError(`User already exists`);
    }

    // Hash password
    payload.password = await bcrypt.hash(payload.password, 10);
    return this.repo.insertUser(payload);
  }
}
