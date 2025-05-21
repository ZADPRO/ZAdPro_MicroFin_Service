import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { refDashboard } from "./controller";
import IRoute from "../../helper/routes";

export class refDashboardRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new refDashboard();
      server.route([
        {
          method: "POST",
          path: "/api/v1/refDashboard/Count",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.dashBoardCount,
            description: "Get Dashboard Count",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
