import * as Hapi from "@hapi/hapi";
import { adminRoutes } from "./api/admin/routes";
import { rePaymentRoutes } from "./api/repayment/routes";
import { refDashboardRoutes } from "./api/dashboard/routes";
export default class Router {
  public static async loadRoutes(server: Hapi.Server): Promise<any> {
    await new adminRoutes().register(server);
    await new rePaymentRoutes().register(server);
    await new refDashboardRoutes().register(server);
  }
}
