import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { openClosingBalController } from "./controller";
import IRoute from "../../helper/routes";

export class openClosingBalRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new openClosingBalController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/openClosingBalance/getData",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.getData,
            description: "get Closing and Opening Balance Data",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
