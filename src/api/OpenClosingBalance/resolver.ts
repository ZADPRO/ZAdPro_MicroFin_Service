import { openClosingBalRepository } from "./openClosingBalance-Repository";

export class openClosingBalResolver {
  public openClosingBalRepository: any;
  constructor() {
    this.openClosingBalRepository = new openClosingBalRepository();
  }
  public async getDataV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.openClosingBalRepository.getDataV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
