import { expenseRepository } from "./expense-Repository";

export class expenseResolver {
  public expenseRepository: any;
  constructor() {
    this.expenseRepository = new expenseRepository();
  }
  public async addExpenseV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.expenseRepository.addExpenseV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async expenseDataV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.expenseRepository.expenseDataV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async expenseOptionV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.expenseRepository.expenseOptionV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async expenseUpdateDataV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.expenseRepository.expenseUpdateDataV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async expenseUpdateV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.expenseRepository.expenseUpdateV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
