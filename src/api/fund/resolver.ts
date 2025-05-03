import { fundRepository } from "./fund-Repository";

export class fundResolver {
  public fundRepository: any;
  constructor() {
    this.fundRepository = new fundRepository();
  }
  public async selfTransferV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.fundRepository.selfTransferV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async agentCollectionV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.fundRepository.agentCollectionV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
