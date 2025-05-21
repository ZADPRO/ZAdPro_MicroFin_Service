import { CashFlowRepository } from "./cashflow-Repository";

export class CashFlowResolver {
  public CashFlowRepository: any;
  constructor() {
    this.CashFlowRepository = new CashFlowRepository();
  }
  public async getCashFlowV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.CashFlowRepository.getCashFlowV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updateCashFlowV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    return await this.CashFlowRepository.updateCashFlowV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
