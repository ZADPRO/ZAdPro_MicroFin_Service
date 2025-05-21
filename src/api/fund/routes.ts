import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { fundController } from "./controller";
import IRoute from "../../helper/routes";

export class fundRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new fundController();
      server.route([
        {
          method: "POST",
          path: "/api/v1/fund/selfTransfer",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.selfTransfer,
            description: "Self Amount Transfer",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/fund/agentCollection",
          config: {
           pre: [{ method: validateToken, assign: "token" }],
            handler: controller.agentCollection,
            description: "agent collected amount",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
