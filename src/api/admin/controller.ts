import * as Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";

import logger from "../../helper/logger";

import { decodeToken } from "../../helper/token";
import { AdminResolver } from "./resolver";

export class adminProfile {
  public resolver: any;
  constructor() {
    this.resolver = new AdminResolver();
  }
  public adminLogin = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);

    try {
      const entity = await this.resolver.adminLoginV1(request.payload);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in admin Login", error);
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
  public addNewPerson = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.addNewPersonV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in add new agent or customer", error);
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
  public getPerson = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      const entity = await this.resolver.getPersonV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in get Customer", error);
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

  public getPersonList = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      const entity = await this.resolver.getPersonListV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in get Customer", error);
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

  public updatePerson = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      // const decodedToken = {id:1};

      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.updatePersonV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in update agent or customer", error);
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
  public profileUpload = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    
    const decodedToken = {
      id: request.plugins.token.id,
    };
    try {
      const entity = await this.resolver.profileUploadV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in upload profile documents ", error);
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
  public addBankAccount = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.addBankAccountV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in add bank account", error);
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
  public updateBankAccount = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.updateBankAccountV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in update bank account", error);
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
  public getBankAccountList = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.getBankAccountListV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in get bank account", error);
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
  public addProduct = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.addProductV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in add product", error);
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
  public updateProduct = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      const entity = await this.resolver.updateProductV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in update product", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public productList = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      const entity = await this.resolver.productListV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in list the product", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public getProduct = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      const entity = await this.resolver.getProductV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in get the product", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public referenceAadharUpload = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    const decodedToken = {
      id: request.plugins.token.id,
    };
    try {
      const entity = await this.resolver.referenceAadharUploadV1(
        request.payload,
        decodedToken
      );

      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in reference Aadhar Upload ", error);
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
  public addReference = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      const entity = await this.resolver.addReferenceV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in add Reference ", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public getReference = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      const entity = await this.resolver.getReferenceV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in add Reference ", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public addBankFund = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.addBankFundV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in add bank fund", error);
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
  public getBankList = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken", decodedToken);
      const entity = await this.resolver.getBankListV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in get bank list", error);
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
  public viewBankFund = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id
      }
      // const decodedToken = {
      //   id: 1,
      // };
      const entity = await this.resolver.viewBankFundV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in view bank fund", error);
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
  public getBankFundList = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      console.log("decodedToken line ------- 609", decodedToken)
      const entity = await this.resolver.getBankFundListV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in view bank fund list", error);
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
  public addLoan = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      const entity = await this.resolver.addLoanV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in add Loan ", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public updateLoan = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      const entity = await this.resolver.updateLoanV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in update Loan ", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public getLoanList = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };

      const entity = await this.resolver.getLoanListV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in view loan list 708", error);
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
  public getLoanAndUser = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };

      const entity = await this.resolver.getLoanAndUserV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in view loan and user list", error);
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
  public getLoan = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id
      }

      const entity = await this.resolver.getLoanV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed

    } catch (error) {
      logger.error("Error in view loan list 770", error);
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
  public rePaymentSchedule = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      const entity = await this.resolver.rePaymentScheduleV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in rePayment Schedule ", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public userFollowUp = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      // const decodedToken = {id:1};

      const entity = await this.resolver.userFollowUpV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in rePayment Schedule ", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred in controller",
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
      };
      // const decodedToken = {id:1};

      const entity = await this.resolver.updateFollowUpV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in rePayment Schedule ", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public ListRePaymentSchedule = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      const entity = await this.resolver.ListRePaymentScheduleV1(
        request.payload,
        decodedToken
      );
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in list rePayment Schedule ", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public addPayment = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      const entity = await this.resolver.addPaymentV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in add Payment ", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
  public listUnPaid = async (
    request: any,
    response: Hapi.ResponseToolkit
  ): Promise<any> => {
    logger.info(`ROUTE API CALL => \n ${request.url.href}`);
    try {
      const decodedToken = {
        id: request.plugins.token.id,
      };
      const entity = await this.resolver.listUnPaidV1(request.payload, decodedToken);
      if (entity.success) {
        return response.response(entity).code(201); // Created
      }
      return response.response(entity).code(200); // Bad Request if failed
    } catch (error) {
      logger.error("Error in list UnPaid", error);
      return response
        .response({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred in controller",
        })
        .code(500);
    }
  };
}
