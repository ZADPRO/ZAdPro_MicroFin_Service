import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { expenseController } from "./controller";
import IRoute from "../../helper/routes";

export class expenseRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new expenseController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/expense/addExpense",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addExpense,
            description: "Add New Expense Entry",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/expense/expenseData",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.expenseData,
            description: "Get the Expense Data",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/expense/expenseOption",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.expenseOption,
            description: "Get Expense Option",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/expense/expenseUpdateData",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.expenseUpdateData,
            description: "Get Expense Data for update",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/expense/expenseUpdate",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.expenseUpdate,
            description: "Update Exesting Expense Data",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
