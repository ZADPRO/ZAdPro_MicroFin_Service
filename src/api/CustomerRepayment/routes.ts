import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { CustomerRepaymentController } from "./controller";
import IRoute from "../../helper/routes";

export class CustomerRepaymentRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new CustomerRepaymentController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/customerRepayment/unPaidList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.unPaidList,
            description: "Get Loan Unpaid List",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/customerRepayment/loanDetails",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.loanDetails,
            description: "Get Loan Details",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/customerRepayment/rePaymentData",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.rePaymentData,
            description: "Get Loan Repayment Data",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
