import * as Hapi from "@hapi/hapi";

import logger from "../../helper/logger";
import { AdminRePaymentResolver } from "./resolver";

export class AdminRePayment {
  public resolver: any;
  constructor() {
    this.resolver = new AdminRePaymentResolver();
  }
  public unPaidUserList = async (
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
      const entity = await this.resolver.unPaidUserListV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error in getting Loan unpaid User List", error);
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
  public rePaymentCalculation = async (
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
      const entity = await this.resolver.rePaymentCalculationV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error in getting Loan unpaid User List", error);
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
  public updateRePayment = async (
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
      const entity = await this.resolver.updateRePaymentV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error in getting Loan unpaid User List", error);
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
  public updateFollowUp = async (
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
      const entity = await this.resolver.updateFollowUpV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error in getting Loan unpaid User List", error);
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
