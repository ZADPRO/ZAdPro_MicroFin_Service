import { AreaRepository } from "./area-Repository";

export class AreaResolver {
  public AreaRepository: any;
  constructor() {
    this.AreaRepository = new AreaRepository();
  }
  public async addAreaV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.AreaRepository.addAreaV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async checkPinCodeV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.AreaRepository.checkPinCodeV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async listAreaV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.AreaRepository.listAreaV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async movePinCodeV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.AreaRepository.movePinCodeV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updateAreaV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.AreaRepository.updateAreaV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async reCreateAreaV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.AreaRepository.reCreateAreaV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async validatePinCodeV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.AreaRepository.validatePinCodeV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async areaOptionV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.AreaRepository.areaOptionV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
