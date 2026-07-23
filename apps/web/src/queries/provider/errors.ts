export class ProviderAuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderAuthApiError";
  }
}
