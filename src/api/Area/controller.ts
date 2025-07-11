import * as Hapi from "@hapi/hapi";

import logger from "../../helper/logger";
import { AreaResolver } from "./resolver";

export class Area {
  public resolver: any;
  constructor() {
    this.resolver = new AreaResolver();
  }
  public addArea = async (
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
      const entity = await this.resolver.addAreaV1(
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
  public checkPinCode = async (
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
      const entity = await this.resolver.checkPinCodeV1(
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
  public listArea = async (
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
      const entity = await this.resolver.listAreaV1(
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
  public movePinCode = async (
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
      const entity = await this.resolver.movePinCodeV1(
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
  public updateArea = async (
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
      const entity = await this.resolver.updateAreaV1(
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
  public reCreateArea = async (
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
      const entity = await this.resolver.reCreateAreaV1(
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
  public validatePinCode = async (
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
      const entity = await this.resolver.validatePinCodeV1(
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
  public areaOption = async (
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
      const entity = await this.resolver.areaOptionV1(
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

  // Version 2
  public addNewArea = async (
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
      const entity = await this.resolver.addNewAreaV1(
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
  public allAreaList = async (
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
      const entity = await this.resolver.allAreaListV1(
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
  public filteredAreaList = async (
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
      const entity = await this.resolver.filteredAreaListV1(
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
