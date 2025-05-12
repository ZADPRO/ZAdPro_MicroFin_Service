import { AdminRePaymentRepository } from "./AdminRepayment-repository";

export class AdminRePaymentResolver {
  public AdminRePaymentRepository: any;
  constructor() {
    this.AdminRePaymentRepository = new AdminRePaymentRepository();
  }
  public async unPaidUserListV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.AdminRePaymentRepository.unPaidUserListV1(
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
    return await this.AdminRePaymentRepository.rePaymentCalculationV1(
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
    return await this.AdminRePaymentRepository.updateRePaymentV1(
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
    return await this.AdminRePaymentRepository.updateFollowUpV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
