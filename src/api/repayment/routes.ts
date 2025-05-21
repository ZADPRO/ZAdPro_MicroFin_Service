import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { rePayment } from "./controller";
import IRoute from "../../helper/routes";

export class rePaymentRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new rePayment();
      server.route([
        {
          method: "POST",
          path: "/api/v1/rePayment/userList",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.unPaidUserList,
            description: "Loan Unpaid User List",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/rePayment/rePaymentCalculation",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.rePaymentCalculation,
            description: "Loan Repayment Calculation",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/rePayment/updateRePayment",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateRePayment,
            description: "Update Repayment Loan",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/rePayment/updateFollowUp",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateFollowUp,
            description: "Update Follow Up Message",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/rePayment/loanAudit",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.loanAudit,
            description: "Getting The Loan Audit",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/rePayment/loanDetails",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.loanDetails,
            description: "Getting The Loan Details",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/rePayment/Notification",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.Notification,
            description: "Sending Notification",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/rePayment/loanCloseData",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.loanCloseData,
            description: "Passing the Loan Close Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/rePayment/payPrincipalAmt",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.payPrincipalAmt,
            description: "Pay Loan Principal Amount",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
