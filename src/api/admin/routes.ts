import * as Hapi from "@hapi/hapi";
// import { Logger } from "winston";
import { decodeToken, validateToken } from "../../helper/token";
import { adminProfile } from "./controller";
import IRoute from "../../helper/routes";

export class adminRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new adminProfile();
      server.route([
        {
          method: "POST",
          path: "/api/v1/adminRoutes/adminLogin",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.adminLogin,
            description: "admin Login",
            // tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/addPerson",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addNewPerson,
            description: "Add New person ",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/getPerson",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getPerson,
            description: "get Customer and agent ",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/getPersonList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getPersonList,
            description: "get Customer and agent list ",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/updatePerson",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updatePerson,
            description: "update person ",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/profileUpload",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.profileUpload,
            description: "Upload profile",
            tags: ["api", "Users"],
            auth: false,
            payload: {
              maxBytes: 10485760,
              output: "stream",
              parse: true,
              multipart: true,
            },
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/addBankAccount",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addBankAccount,
            description: "Add bank details ",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/updateBankAccount",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateBankAccount,
            description: "update bank details ",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/adminRoutes/getBankAccountList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getBankAccountList,
            description: "getBankAccountList",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/addProduct",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addProduct,
            description: "add Product",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/updateProduct",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateProduct,
            description: "update Product",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/adminRoutes/productList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.productList,
            description: "list Products",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/getProduct",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getProduct,
            description: "get Product",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/referenceAadharUpload",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.referenceAadharUpload,
            description: "reference Aadhar Upload",
            tags: ["api", "Users"],
            auth: false,
            payload: {
              maxBytes: 10485760,
              output: "stream",
              parse: true,
              multipart: true,
            },
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/addReference",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addReference,
            description: "add Reference",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/getReference",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getReference,
            description: "get Reference",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/addBankFund",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addBankFund,
            description: "add Bank Fund",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/adminRoutes/getBankList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getBankList,
            description: "add Bank Fund",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/viewBankFund",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.viewBankFund,
            description: "view Bank Fund",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/adminRoutes/getBankFundList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getBankFundList,
            description: "view Bank Fund list",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/addLoanOption",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addLoanOption,
            description: "add Loan",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/addLoan",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addLoan,
            description: "add Loan",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/updateLoan",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateLoan,
            description: "update Loan ",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/adminRoutes/getLoanList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getLoanList,
            description: "get Loan status",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/adminRoutes/getLoanAndUser",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getLoanAndUser,
            description: "get Loan and user",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/adminRoutes/getAllLoan",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getAllLoan,
            description: "get All Loan Data",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/getLoan",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getLoan,
            description: "get Loan ",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/rePaymentSchedule",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.rePaymentSchedule,
            description: "rePayment Schedule",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/userFollowUp",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.userFollowUp,
            description: "user FollowUp",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/updateFollowUp",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateFollowUp,
            description: "update user FollowUp",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/adminRoutes/ListRePaymentSchedule",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.ListRePaymentSchedule,
            description: "list rePayment Schedule",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/addPayment",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addPayment,
            description: "add Payment",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/adminRoutes/listUnPaid",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.listUnPaid,
            description: "list UnPaid",
            tags: ["api", "Users"],
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminRoutes/listOfUnPaidUsers",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.listOfUnPaidUsers,
            description: "list Unpaid User List",
            tags: ["api", "Users"],
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
