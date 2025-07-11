import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { Settings } from "./controller";
import IRoute from "../../helper/routes";

export class SettingsRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new Settings();
      server.route([
        {
          method: "GET",
          path: "/api/v1/settings/CustomerId/getOption",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.CustomerIdGetOption,
            description: "Get Customer Id Type Option",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/settings/LoanId/getOption",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.LoanIdGetOption,
            description: "Get Loan Type Id Option",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/settings/paymentMethod/getOption",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.PaymentMethodGetOption,
            description: "Get Payment Method Options",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/settings/updateOption",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.CustomerIdUpdateOption,
            description: "Update Customer Id Option",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/settings/overAllData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getSettingsData,
            description: "Update Customer Id Option",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
