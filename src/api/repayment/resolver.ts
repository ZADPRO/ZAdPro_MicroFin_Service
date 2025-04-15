import { rePaymentRepository } from "./repayment-repository";

export class RePaymentResolver {
  public rePaymentRepository: any;
  constructor() {
    this.rePaymentRepository = new rePaymentRepository();
  }
  public async unPaidUserListV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.rePaymentRepository.unPaidUserListV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async rePaymentCalculationV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.rePaymentRepository.rePaymentCalculationV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updateRePaymentV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.rePaymentRepository.updateRePaymentV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updateFollowUpV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.rePaymentRepository.updateFollowUpV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async loanAuditV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.rePaymentRepository.loanAuditV1(
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
    return await this.rePaymentRepository.loanDetailsV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async NotificationV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.rePaymentRepository.NotificationV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
