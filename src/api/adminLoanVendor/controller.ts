import * as Hapi from "@hapi/hapi";

import logger from "../../helper/logger";
import { adminLoanVendorResolver } from "./resolver";

export class adminLoanVendor {
  public resolver: any;
  constructor() {
    this.resolver = new adminLoanVendorResolver();
  }
  public addNewVendor = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      // const decodedToken = {
      //   id: request.plugins.token.id,
      // };
      const decodedToken = {
        id: 1,
      };
      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.addNewVendorV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error in Storing New Vendor Details", error);
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
  public updateVendor = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      // const decodedToken = {
      //   id: request.plugins.token.id,
      // };
      const decodedToken = {
        id: 1,
      };
      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.updateVendorV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error in Updating the Vendor Details", error);
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
  public list = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      // const decodedToken = {
      //   id: request.plugins.token.id,
      // };
      const decodedToken = {
        id: 1,
      };
      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.listV1(request.payload, decodedToken);

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error in Getting Vendor List", error);
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
  public details = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      // const decodedToken = {
      //   id: request.plugins.token.id,
      // };
      const decodedToken = {
        id: 1,
      };
      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.detailsV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error in Getting Vendor Details", error);
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
