import { testingRepository } from "./fund-Repository";

export class testingResolver {
  public testingRepository: any;
  constructor() {
    this.testingRepository = new testingRepository();
  }
  public async mailV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.testingRepository.mailV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
