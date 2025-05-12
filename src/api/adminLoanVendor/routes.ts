import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { adminLoanVendor } from "./controller";
import IRoute from "../../helper/routes";

export class adminLoanVendorRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new adminLoanVendor();
      server.route([
        {
          method: "POST",
          path: "/api/v1/adminLoan/Vendor/add",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addNewVendor,
            description: "Store New Vendor Details",
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminLoan/vendor/update",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateVendor,
            description: "Updating Vendor Details",
          },
        },
        {
          method: "GET",
          path: "/api/v1/adminLoan/vendor/list",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.list,
            description: "Getting Vendor List",
          },
        },
        {
          method: "POST",
          path: "/api/v1/adminLoan/vendor/details",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.details,
            description: "Getting Vendor Details",
          },
        },
      ]);
      resolve(true);
    });
  }
}
