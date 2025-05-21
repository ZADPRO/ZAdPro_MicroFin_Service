import { ReportRepository } from "./report-Repository";

export class ReportResolver {
  public ReportRepository: any;
  constructor() {
    this.ReportRepository = new ReportRepository();
  }
  public async overAllReportOptionV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.ReportRepository.overAllReportOptionV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async overAllReportV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.ReportRepository.overAllReportV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async monthlyReportV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.ReportRepository.monthlyReportV1(
      user_data,
      token_data,
      domain_code
    );
  }
  public async expenseReportV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.ReportRepository.expenseReportV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
