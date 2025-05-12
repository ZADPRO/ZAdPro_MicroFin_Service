import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import IRoute from "../../helper/routes";
import { adminLoanCreation } from "./controller";

export class adminLoanCreationRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new adminLoanCreation();
      server.route([
        {
          method: "GET",
          path: "/api/v1/adminLoan/vendorList",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.vendorList,
            description: "Get The Vendor List",
          },
        },
        {
          method: "GET",
          path: "/api/v1/adminLoan/selectLoan",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.selectLoan,
            description: "Get The All Loan Details",
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminLoan/addLoanOption",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addLoanOption,
            description: "Get The All Loan Details",
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminLoan/CreateNewLoan",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.CreateNewLoan,
            description: "Creating the New Admin Loan",
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminLoan/getLoan",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getLoan,
            description: "getting Loan Details",
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminLoan/selectedLoanDetails",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.selectedLoanDetails,
            description: "getting Old Loan Data",
          },
        },
        {
          method: "GET",
          path: "/api/v1/adminLoan/allLoan",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.allLoan,
            description: "getting All Loan List",
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminLoan/loanAudit",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.loanAudit,
            description: "getting Details About the Loan",
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminLoan/loanRePaymentAudit",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.loanRePaymentAudit,
            description: "getting Details About the Loan Repayment",
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminLoan/loanCloseData",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.loanCloseData,
            description: "Get Loan Close Data",
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminLoan/payPrincipalAmt",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.payPrincipalAmt,
            description: "Pay Principal Amount for Loan",
          },
        },
      ]);
      resolve(true);
    });
  }
}
