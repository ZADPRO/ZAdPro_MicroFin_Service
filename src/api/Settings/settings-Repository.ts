import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import { storeFile, viewFile, deleteFile } from "../../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithoutExpire } from "../../helper/token";

import logger from "../../helper/logger";
import {
  getCustomerIdTypeOption,
  getLoanAdvanceCalOption,
  getLoanClosingCal,
  getLoanIdTypeOption,
  getLoanType,
  getLoanTypeVisible,
  getRepaymentType,
  getRePaymentTypeVisible,
  getSeetings,
  updateLoanType,
  updateRePaymentType,
  updateSettings,
} from "./query";
import { buildBulkInsertQuery } from "../../helper/buildquery";

export class SettingsRepository {
  public async CustomerIdGetOptionV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const option = await executeQuery(getCustomerIdTypeOption);
      const settings = await executeQuery(getSeetings);

      return encrypt(
        {
          success: true,
          message: "Customer Id Settings Data Passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          option: option,
          settings: settings,
        },
        true
      );
    } catch (error) {
      const message =
        "\n\nError In Getting the Setting Data of Customer Id Settings";
      logger.error(message, error);
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
  public async LoanIdGetOptionV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const option = await executeQuery(getLoanIdTypeOption);
      const loanCalOption = await executeQuery(getLoanClosingCal);
      const settings = await executeQuery(getSeetings);
      const loanTypeList = await executeQuery(getLoanType);
      const rePaymentTypeList = await executeQuery(getRepaymentType);
      const loanTypeVisible = await executeQuery(getLoanTypeVisible);
      const rePaymentTypeVisible = await executeQuery(getRePaymentTypeVisible);
      const loanAdvanceCalOption = await executeQuery(getLoanAdvanceCalOption);

      return encrypt(
        {
          success: true,
          message: "Loan Id Settings Data Passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          option: option,
          loanCalOption: loanCalOption,
          settings: settings,
          loanType: loanTypeList,
          rePaymentType: rePaymentTypeList,
          loanTypeVisible: loanTypeVisible,
          rePaymentTypeVisible: rePaymentTypeVisible,
          loanAdvanceCalOption: loanAdvanceCalOption,
        },
        true
      );
    } catch (error) {
      const message =
        "\n\nError In Getting the Setting Data of Loan Id Settings";
      logger.error(message, error);
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
  public async PaymentMethodGetOptionV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const settings = await executeQuery(getSeetings);

      return encrypt(
        {
          success: true,
          message: "Payment Method Data and Option is Passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          settings: settings,
        },
        true
      );
    } catch (error) {
      const message =
        "\n\nError In Getting the Payment Method Options And Data";
      logger.error(message, error);
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
  public async CustomerIdUpdateOptionV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const client: PoolClient = await getClient();
    console.log("user_data line ----- 137", user_data);

    try {
      await client.query("BEGIN");
      await client.query(updateSettings, [JSON.stringify(user_data.settings)]);
      if (user_data.loanType) {
        // const query = await buildBulkInsertQuery(
        //   "public",
        //   "refLoanType",
        //   ["refLoanTypeId", "refLoanType"],
        //   user_data.loanType
        // );
        // console.log("query line ------ 138", query);
        // await client.query(query.truncateQuery);
        // await client.query(query.query, query.values);
        await client.query(updateLoanType, [user_data.loanType]);
      }

      if (user_data.rePaymentType) {
        // const query = await buildBulkInsertQuery(
        //   "public",
        //   "refRepaymentType",
        //   ["refRepaymentTypeId", "refRepaymentTypeName"],
        //   user_data.rePaymentType
        // );
        // console.log("query line ----- 154", query);
        // await client.query(query.truncateQuery);
        // await client.query(query.query, query.values);
        await client.query(updateRePaymentType, [user_data.rePaymentType]);
      }

      client.query("COMMIT");
      return encrypt(
        {
          success: true,
          message: "Update Customer Id Generation Setting Option",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      await client.query("ROLLBACK");
      const message = "\n\nError In Updating the Customer Id Option Setting";
      logger.error(message, error);
      return encrypt(
        {
          success: false,
          message: message,
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async getSettingsDataV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const settings = await executeQuery(getSeetings);

      return encrypt(
        {
          success: true,
          message: "Get Settings Data Overall",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      const message = "\n\nError In Getting Overall Settings Data";
      logger.error(message, error);
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
