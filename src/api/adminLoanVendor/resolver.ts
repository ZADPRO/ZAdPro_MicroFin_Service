import { adminLoanVendorRepository } from "./adminLoanVendor-repository";

export class adminLoanVendorResolver {
  public adminLoanVendorRepository: any;
  constructor() {
    this.adminLoanVendorRepository = new adminLoanVendorRepository();
  }
  public async addNewVendorV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.adminLoanVendorRepository.addNewVendorV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async updateVendorV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.adminLoanVendorRepository.updateVendorV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async listV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.adminLoanVendorRepository.listV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async detailsV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.adminLoanVendorRepository.detailsV1(
      user_data,
      token_data,
      domain_code
    );
  }
  
}
