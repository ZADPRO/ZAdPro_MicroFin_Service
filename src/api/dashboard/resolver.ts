import { refDashboardRepository } from "./dashboard-repository";

export class refDashboardResolver {
  public refDashboardRepository: any;
  constructor() {
    this.refDashboardRepository = new refDashboardRepository();
  }
  public async dashBoardCountV1(
    user_data: any,
    token_data: any,
    domain_code: any
  ): Promise<any> {
    console.log("Resolver Started");
    return await this.refDashboardRepository.dashBoardCountV1(
      user_data,
      token_data,
      domain_code
    );
  }
}
