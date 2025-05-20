import { newLoanRepository } from "./newLoan-Repository";

export class NewLoanResolver {
  public newLoanRepository: any;
  constructor() {
    this.newLoanRepository = new newLoanRepository();
  }
  public async selectLoanV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.newLoanRepository.selectLoanV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async selectedLoanDetailsV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.newLoanRepository.selectedLoanDetailsV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async CreateNewLoanV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.newLoanRepository.CreateNewLoanV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async userListOptionV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.newLoanRepository.userListOptionV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
