import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { Area } from "./controller";
import IRoute from "../../helper/routes";

export class AreaRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new Area();
      server.route([
        {
          method: "POST",
          path: "/api/v1/area/addArea",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addArea,
            description: "Add the Area Details",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/area/checkPinCode",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.checkPinCode,
            description: "Validate Pincode",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/area/listArea",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.listArea,
            description: "List all the Area",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/area/movePinCode",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.movePinCode,
            description: "Move pincode to area to area",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/area/updateArea",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.updateArea,
            description: "update PinCode and  Area",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/area/reCreateArea",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.reCreateArea,
            description: "Create a new Area from the Old PinCode",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/area/validatePinCode",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.validatePinCode,
            description: "Validating the PinCode",
            auth: false,
          },
        },

        {
          method: "GET",
          path: "/api/v1/area/option",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.areaOption,
            description: "Get Area Option",
            auth: false,
          },
        },

        // Version 2

        {
          method: "POST",
          path: "/api/v1/area/addNewArea",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addNewArea,
            description: "Adding New Area in V2",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/area/allAreaList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.allAreaList,
            description: "List All The Area",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/area/allAreaList",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.filteredAreaList,
            description: "Get Filtered Area List",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
