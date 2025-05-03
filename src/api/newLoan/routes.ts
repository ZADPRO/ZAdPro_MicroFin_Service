import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { newLoan } from "./controller";
import IRoute from "../../helper/routes";

export class newLoanRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new newLoan();
      server.route([
        {
          method: "POST",
          path: "/api/v1/newLoan/selectLoan",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.selectLoan,
            description: "list of Loan to select",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/newLoan/selectedLoanDetailsV1",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.selectedLoanDetails,
            description: "Getting Loan Details On Selected Loan",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/newLoan/CreateNewLoan",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.CreateNewLoan,
            description: "Creating New Loan",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
