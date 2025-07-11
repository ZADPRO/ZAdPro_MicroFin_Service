import { encrypt } from "../../helper/encrypt";
import { generateTokenWithoutExpire } from "../../helper/token";
import axios from "axios";
import qs from "qs";
require("isomorphic-fetch");

import { Client } from "minio";
import { createUploadUrl } from "../../helper/minIoStorage";
import { executeQuery, getClient } from "../../helper/db";
import {
  addNewProduct,
  getAllProduct,
  getLoanTypeList,
  getRePaymentTypeList,
  nameQuery,
  updateProduct,
} from "./query";
import logger from "../../helper/logger";
import { PoolClient } from "pg";
export class ProductRepository {
  public async productOptionsV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata?.id, cash: tokendata?.cash };

    try {
      const loanType = await executeQuery(getLoanTypeList);
      const rePaymentType = await executeQuery(getRePaymentTypeList);
      return encrypt(
        {
          success: true,
          message: "Product Option is passed successfully",
          token: generateTokenWithoutExpire(token, true),
          loanType: loanType,
          rePaymentType: rePaymentType,
        },
        true
      );
    } catch (error) {
      const message = "Error in sending the product Options";
      console.error(message, error);
      logger.error(`\n\n${message}\n\n`);
      return encrypt(
        {
          success: false,
          message: message,
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async addProductV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata?.id, cash: tokendata?.cash };
    try {
      const params = [
        user_data.productData.productName,
        user_data.productData.interest,
        user_data.productData.repaymentType,
        user_data.productData.loanDueType,
        user_data.productData.duration,
        user_data.productData.InterestCalType,
        user_data.productData.status,
        user_data.productData.description,
      ];
      console.log("params", params);
      await executeQuery(addNewProduct, params);
      return encrypt(
        {
          success: true,
          message: "New Product Added Successfully",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      const message = "Error in adding New Loan Product";
      console.error(message, error);
      logger.error(`\n\n${message}\n\n`);
      return encrypt(
        {
          success: false,
          message: message,
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async upDateProductV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata?.id, cash: tokendata?.cash };
    try {
      const params = [
        user_data.productData.productName,
        user_data.productData.interest,
        user_data.productData.repaymentType,
        user_data.productData.loanDueType,
        user_data.productData.duration,
        user_data.productData.InterestCalType,
        user_data.productData.status,
        user_data.productData.description,
        user_data.productData.productId,
      ];
      console.log("params", params);
      await executeQuery(updateProduct, params);
      return encrypt(
        {
          success: true,
          message: "New Product Added Successfully",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      const message = "Error in adding New Loan Product";
      console.error(message, error);
      logger.error(`\n\n${message}\n\n`);
      return encrypt(
        {
          success: false,
          message: message,
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async productListV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata?.id, cash: tokendata?.cash };

    try {
      const product = await executeQuery(getAllProduct);
      const name = await executeQuery(nameQuery, [tokendata.id]);

      return encrypt(
        {
          success: true,
          message: "All product list Passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          product: product,
          name: name,
        },
        true
      );
    } catch (error) {
      const message = "Error in passing all Product Data";
      console.error(message, error);
      logger.error(`\n\n${message}\n\n`);
      return encrypt(
        {
          success: false,
          message: message,
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
}
