import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { TestingController } from "./controller";
import IRoute from "../../helper/routes";

export class testingRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new TestingController();
      server.route([
        {
          method: "GET",
          path: "/api/v1/test/mail",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.mail,
            description: "Self Amount Transfer",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
