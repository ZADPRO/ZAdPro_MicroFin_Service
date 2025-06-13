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
  getLoanIdTypeOption,
  getSeetings,
  updateSettings,
} from "./query";

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
      const settings = await executeQuery(getSeetings);

      return encrypt(
        {
          success: true,
          message: "Loan Id Settings Data Passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          option: option,
          settings: settings,
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
  public async CustomerIdUpdateOptionV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      await executeQuery(updateSettings, [user_data.id, user_data.value]);
      return encrypt(
        {
          success: true,
          message: "Update Customer Id Generation Setting Option",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
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
    }
  }
}
