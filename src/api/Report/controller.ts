import * as Hapi from "@hapi/hapi";

import logger from "../../helper/logger";
import { ReportResolver } from "./resolver";

export class report {
  public resolver: any;
  constructor() {
    this.resolver = new ReportResolver();
  }
  public overAllReportOption = async (
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
      const entity = await this.resolver.overAllReportOptionV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error In listing the Loan", error);
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
  public overAllReport = async (
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
      const entity = await this.resolver.overAllReportV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error In listing the Loan", error);
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
  public monthlyReport = async (
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
      const entity = await this.resolver.monthlyReportV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201);
      }
      return response.response(entity).code(200);
    } catch (error) {
      logger.error("Error In listing the Loan", error);
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
