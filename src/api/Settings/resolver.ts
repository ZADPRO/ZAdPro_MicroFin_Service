import { SettingsRepository } from "./settings-Repository";

export class SettingsResolver {
  public SettingsRepository: any;
  constructor() {
    this.SettingsRepository = new SettingsRepository();
  }
  public async CustomerIdGetOptionV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.SettingsRepository.CustomerIdGetOptionV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async LoanIdGetOptionV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.SettingsRepository.LoanIdGetOptionV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async PaymentMethodGetOptionV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.SettingsRepository.PaymentMethodGetOptionV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async CustomerIdUpdateOptionV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.SettingsRepository.CustomerIdUpdateOptionV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getSettingsDataV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.SettingsRepository.getSettingsDataV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
