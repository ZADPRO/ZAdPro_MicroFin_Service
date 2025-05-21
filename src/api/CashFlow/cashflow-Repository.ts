import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import { storeFile, viewFile, deleteFile } from "../../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithoutExpire } from "../../helper/token";

export class CashFlowRepository {
  public async getCashFlowV1(user_data: any, tokendata?: any): Promise<any> {
    let token = { id: tokendata.id, cash: tokendata.cash };

    try {
      console.log("token", token);
      return encrypt(
        {
          success: true,
          message: "Cash Flow Passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          cashFlow: tokendata.cash,
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      return encrypt(
        {
          success: false,
          message: "Error in Passing teh Cash Flow",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async updateCashFlowV1(user_data: any, tokendata?: any): Promise<any> {
    let token = { id: tokendata.id, cash: tokendata.cash };

    try {
      token = { id: tokendata.id, cash: user_data.cashFlow };
      console.log("token", token);
      return encrypt(
        {
          success: true,
          message: "Cash Flow Updated Successfully",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      return encrypt(
        {
          success: false,
          message: "Error in updating the cash flow",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
}
