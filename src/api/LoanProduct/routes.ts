import * as Hapi from "@hapi/hapi";
import { decodeToken, validateToken } from "../../helper/token";
import { ProductController } from "./controller";
import IRoute from "../../helper/routes";

export class ProductRoutes implements IRoute {
  public async register(server: any): Promise<any> {
    return new Promise((resolve) => {
      const controller = new ProductController();
      server.route([
        {
          method: "GET",
          path: "/api/v1/product/productOptions",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.productOptions,
            description:
              "Getting the Options For the Product creation and update",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/product/addNewProduct",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.addProduct,
            description: "Add New Loan Product",
            auth: false,
          },
        },
        {
          method: "POST",
          path: "/api/v1/product/upDateProduct",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.upDateProduct,
            description: "upDateLoan Product",
            auth: false,
          },
        },
        {
          method: "GET",
          path: "/api/v1/product/list",
          config: {
            pre: [{ method: validateToken, assign: "token" }],
            handler: controller.productList,
            description: "Get all Product List",
            auth: false,
          },
        },
      ]);
      resolve(true);
    });
  }
}
