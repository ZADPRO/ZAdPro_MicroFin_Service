import * as Hapi from "@hapi/hapi";

import logger from "../../helper/logger";
import { SettingsResolver } from "./resolver";

export class Settings {
  public resolver: any;
  constructor() {
    this.resolver = new SettingsResolver();
  }
  public CustomerIdGetOption = async (
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
      const entity = await this.resolver.CustomerIdGetOptionV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error In Getting Area List", error);
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
  public LoanIdGetOption = async (
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
      const entity = await this.resolver.LoanIdGetOptionV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error In Getting Area List", error);
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
  public CustomerIdUpdateOption = async (
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
      const entity = await this.resolver.CustomerIdUpdateOptionV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error In Getting Area List", error);
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
