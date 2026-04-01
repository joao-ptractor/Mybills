export class InvalidArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'invalid_argument';
  }
}
