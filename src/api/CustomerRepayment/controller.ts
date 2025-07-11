import * as Hapi from "@hapi/hapi";

import logger from "../../helper/logger";
import { CustomerRePaymentResolver } from "./resolver";

export class CustomerRepaymentController {
  public resolver: any;
  constructor() {
    this.resolver = new CustomerRePaymentResolver();
  }
  public unPaidList = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
        cash: request.plugins.token.cash,
      };

      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.unPaidListV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error in getting Dashboard Count", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        })
        .code(500);
    }
  };
  public loanDetails = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      // const decodedToken = {
      //   id: request.plugins.token.id,
      //   cash: request.plugins.token.cash,
      // };
      const decodedToken = {
        id: 1,
        cash: 1,
      };

      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.loanDetailsV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error in getting Dashboard Count", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        })
        .code(500);
    }
  };
  public rePaymentData = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      // const decodedToken = {
      //   id: request.plugins.token.id,
      //   cash: request.plugins.token.cash,
      // };
      const decodedToken = {
        id: 1,
        cash: 1,
      };

      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.rePaymentDataV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error in getting Dashboard Count", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        })
        .code(500);
    }
  };
}
