import { adminRepository } from "./admin-repository";

export class AdminResolver {
  public adminRepository: any;
  constructor() {
    this.adminRepository = new adminRepository();
  }
  public async adminLoginV1(user_data: any, domain_code: any): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.adminLoginV1(user_data, domain_code);
  }
  public async addNewPersonV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.addNewPersonV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getPersonV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.getPersonV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getPersonListV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.getPersonListV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updatePersonV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.updatePersonV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async profileUploadV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.profileUploadV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addBankAccountV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.addBankAccountV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updateBankAccountV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.updateBankAccountV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getBankAccountListV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.getBankAccountListV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addProductV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.addProductV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updateProductV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.updateProductV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async productListV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.productListV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getProductV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.getProductV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async referenceAadharUploadV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.referenceAadharUploadV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addReferenceV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.addReferenceV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getReferenceV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.getReferenceV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addBankFundV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.addBankFundV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getBankListV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.getBankListV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async viewBankFundV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.viewBankFundV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getBankFundListV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("line ------ 214");
    console.log("Resolver Sarted");
    return await this.adminRepository.getBankFundListV1(
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
    console.log("Resolver Sarted");
    return await this.adminRepository.addLoanOptionV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addLoanV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.addLoanV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updateLoanV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.updateLoanV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getLoanListV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.getLoanListV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async getLoanAndUserV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.getLoanAndUserV1(
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
    console.log("Resolver Sarted");
    return await this.adminRepository.getLoanV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async rePaymentScheduleV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.rePaymentScheduleV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async userFollowUpV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.userFollowUpV1(
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
    console.log("Resolver Sarted");
    return await this.adminRepository.updateFollowUpV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async ListRePaymentScheduleV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.ListRePaymentScheduleV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async addPaymentV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.addPaymentV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async listUnPaidV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.listUnPaidV1(
      user_data,
      token_data,
      domain_code
    );
  }

  public async listOfUnPaidUsersV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Sarted");
    return await this.adminRepository.listOfUnPaidUsersV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
