// Represents a single user entry stored in the database
export type UserEntity = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  passwordHash: string;
};

export type UserPayload = Omit<UserEntity, "id" | "passwordHash"> & {
  password: string;
};

export type UserCredentials = Omit<
  UserEntity,
  "id" | "firstName" | "lastName" | "passwordHash"
> & {
  password: string;
};

export type UserInfo = Omit<UserEntity, "id" | "passwordHash">;
