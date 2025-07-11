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
import {
  addedFundList,
  addFund,
  getOldFund,
  updateBankBalance,
  updateFund,
  updateFundData,
} from "./query";

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
      const params2 = [
        user_data.fromId,
        user_data.toId,
        user_data.amt,
        CurrentTime(),
        tokendata.id,
        6,
      ];
      console.log("params", params);
      await client.query(addFund, params);
      await client.query(updateFund, params2);
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
  public async viewAddedFundsV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const list = await executeQuery(addedFundList, [user_data.date]);

      return encrypt(
        {
          success: true,
          message: "Added Fund List Is Passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          data: list,
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      return encrypt(
        {
          success: false,
          message: "Error in Getting the Added Fund List",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async updateFundsV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const client: PoolClient = await getClient();

    try {
      await client.query("BEGIN");

      const oldFund = await executeQuery(getOldFund, [user_data.refBankFId]);

      await client.query(updateFundData, [
        user_data.refFundType,
        user_data.refbfTransactionAmount,
        user_data.refBankFId,
      ]);

      const upateAmount =
        Number(oldFund[0].refbfTransactionAmount) >
        Number(user_data.refbfTransactionAmount)
          ? Number(oldFund[0].refbfTransactionAmount) -
            Number(user_data.refbfTransactionAmount)
          : Number(user_data.refbfTransactionAmount) -
            Number(oldFund[0].refbfTransactionAmount);
      console.log("upateAmount", upateAmount);
      await client.query(updateBankBalance, [
        upateAmount,
        oldFund[0].refBankId,
        Number(oldFund[0].refbfTransactionAmount) >
        Number(user_data.refbfTransactionAmount)
          ? 1
          : 2,
      ]);
      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Fund UpdatedSuccessfully",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Error in Updating the Fund",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }
}
