import * as Hapi from "@hapi/hapi";
import { adminRoutes } from "./api/admin/routes";




export default class Router {
  public static async loadRoutes(server: Hapi.Server): Promise<any> {
    await new adminRoutes().register(server);

  }
}