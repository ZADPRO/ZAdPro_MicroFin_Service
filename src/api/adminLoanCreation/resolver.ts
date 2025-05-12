import { adminLoanCreationRepository } from "./adminLoanCreation-repository";

export class adminLoanCreationResolver {
  public adminLoanCreationRepository: any;
  constructor() {
    this.adminLoanCreationRepository = new adminLoanCreationRepository();
  }
  public async vendorListV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.adminLoanCreationRepository.vendorListV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async selectLoanV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.adminLoanCreationRepository.selectLoanV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addLoanOptionV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.adminLoanCreationRepository.addLoanOptionV1(
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
    return await this.adminLoanCreationRepository.CreateNewLoanV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getLoanV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.adminLoanCreationRepository.getLoanV1(
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
    return await this.adminLoanCreationRepository.selectedLoanDetailsV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async allLoanV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.adminLoanCreationRepository.allLoanV1(
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
    return await this.adminLoanCreationRepository.loanAuditV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async loanRePaymentAuditV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.adminLoanCreationRepository.loanRePaymentAuditV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async loanCloseDataV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.adminLoanCreationRepository.loanCloseDataV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async payPrincipalAmtV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.adminLoanCreationRepository.payPrincipalAmtV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
