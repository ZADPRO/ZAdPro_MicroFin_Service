import { CustomerRePaymentRepository } from "./CustomerRePayment-repository";

export class CustomerRePaymentResolver {
  public CustomerRePaymentRepository: any;
  constructor() {
    this.CustomerRePaymentRepository = new CustomerRePaymentRepository();
  }
  public async unPaidListV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.CustomerRePaymentRepository.unPaidListV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async loanDetailsV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.CustomerRePaymentRepository.loanDetailsV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async rePaymentDataV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.CustomerRePaymentRepository.rePaymentDataV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
