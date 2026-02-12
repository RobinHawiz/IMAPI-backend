// Represents a domain-level error, used to distinguish business logic failures from other error types
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
  }
}
