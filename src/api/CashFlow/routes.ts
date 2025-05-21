import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { cashFlow } from "./controller";
import IRoute from "../../helper/routes";

export class CashFlowRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new cashFlow();
      server.route([
        {
          method: "GET",
          path: "/api/v1/cashFlow/getCashFlow",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getCashFlow,
            description: "Get Cash Flow",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/cashFlow/updateCashFlow",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateCashFlow,
            description: "update Cash flow Option",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
