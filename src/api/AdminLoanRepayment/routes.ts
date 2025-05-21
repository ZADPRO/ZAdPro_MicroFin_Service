import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { AdminRePayment } from "./controller";
import IRoute from "../../helper/routes";

export class AdminRePaymentRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new AdminRePayment();
      server.route([
        {
          method: "POST",
          path: "/api/v1/AdminRePayment/userList",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.unPaidUserList,
            description: "Loan Unpaid User List",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/AdminRePayment/rePaymentCalculation",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.rePaymentCalculation,
            description: "Loan Details",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/AdminRePayment/updateRePayment",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateRePayment,
            description: "Paying The Repayment",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/AdminRePayment/updateFollowUp",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateFollowUp,
            description: "Admin Loan Repayment Follow Up Message",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
