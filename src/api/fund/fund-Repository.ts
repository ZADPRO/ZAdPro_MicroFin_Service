import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import { storeFile, viewFile, deleteFile } from "../../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithoutExpire } from "../../helper/token";

import { buildUpdateQuery, getChanges } from "../../helper/buildquery";
import { reLabelText } from "../../helper/Label";
import { error } from "console";

import {
  convertToYMD,
  CurrentTime,
  formatYearMonthDate,
} from "../../helper/common";
import { ExtensionBalance, TopUpBalance } from "../../helper/LoanCalculation";
import { addFund, updateFund } from "./query";

export class fundRepository {
  public async selfTransferV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const client: PoolClient = await getClient();

    try {
      console.log("user_data line ----- 28", user_data);
      await client.query("BEGIN");
      const params = [
        user_data.fromId,
        user_data.toId,
        user_data.amt,
        CurrentTime(),
        tokendata.id,
      ];
      console.log("params", params);
      console.log(" -> Line Number ----------------------------------- 38");
      await client.query(addFund, params);
      console.log(" -> Line Number ----------------------------------- 40");
      await client.query(updateFund, params);
      console.log(" -> Line Number ----------------------------------- 42");
      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Self Transfer Amount is Transfered Successfully",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      await client.query("ROLLBACK");

      console.log("error line ----- 30", error);
      return encrypt(
        {
          success: false,
          message: "Error in Self Transfer Amount",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async agentCollectionV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      return encrypt(
        {
          success: false,
          message: "User Loan List",
          token: generateTokenWithoutExpire(token, true),
        },
        false
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      return encrypt(
        {
          success: false,
          message: "Error in User Loan List",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
}
