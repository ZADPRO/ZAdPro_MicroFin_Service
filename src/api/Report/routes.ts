import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { report } from "./controller";
import IRoute from "../../helper/routes";

export class ReportRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new report();
      server.route([
        {
          method: "GET",
          path: "/api/v1/report/overAllReportOption",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.overAllReportOption,
            description: "Get OverAll Report Option",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/report/overAllReport",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.overAllReport,
            description: "Get OverAll Report Data",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/report/monthlyReport",
          config: {
            // pre: [{ method: validateToken, assign: "token" }],
            handler: controller.monthlyReport,
            description: "Get Monthly Report Data",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
