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
  bankType,
  convertToYMD,
  CurrentTime,
  formatYearMonthDate,
} from "../../helper/common";
import { ExtensionBalance, TopUpBalance } from "../../helper/LoanCalculation";
import {
  addCategory,
  expenseCatageory,
  expenseData,
  getBank,
  getExpenseData,
  getExpenseHistoreyData,
  newExpense,
  updateBankAccountCreditQuery,
  updateBankAccountDebitQuery,
  updateBankFundQuery,
  updateExpense,
  updateFund,
} from "./query";

export class expenseRepository {
  public async addExpenseV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const client: PoolClient = await getClient();

    try {
      await client.query("BEGIN");
      let catId = user_data.categoryId;
      console.log("catId line ------------- 44", catId);
      if (user_data.newCategory) {
        const result = await client.query(addCategory, [
          user_data.categoryName,
        ]);
        catId = result.rows[0].refExpenseCategoryId;
      }
      const params = [
        user_data.expenseDate,
        user_data.voucherNo,
        catId,
        user_data.subCategory,
        user_data.Amount,
        user_data.BankID,
        CurrentTime(),
        tokendata.id,
      ];
      console.log("params", params);
      const result = await client.query(newExpense, params);

      console.log("result.rows[0].refExpenseId", result.rows[0].refExpenseId);
      const paramsLoanDebit = [
        user_data.BankID,
        formatYearMonthDate(CurrentTime()),
        "debit",
        user_data.Amount,
        result.rows[0].refExpenseId,
        `${user_data.categoryName}`,
        7,
        CurrentTime(),
        "Admin",
      ];
      console.log("paramsLoanCredit", paramsLoanDebit);
      await client.query(updateBankFundQuery, paramsLoanDebit);

      const paramsUpdateBankAmt = [
        user_data.Amount,
        user_data.BankID,
        CurrentTime(),
        "Admin",
      ];
      console.log("paramsUpdateBankAmt", paramsUpdateBankAmt);
      await client.query(updateBankAccountDebitQuery, paramsUpdateBankAmt);

      await client.query("COMMIT");
      return encrypt(
        {
          success: true,
          message: "New Expense Stored Successfully",
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
          message: "Error in Storing the Expense",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async expenseDataV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      console.log(" -> Line Number ----------------------------------- 117");
      const bank = bankType(tokendata.cash);
      console.log("bank line ------ 119", bank);
      console.log('user_data.month', user_data.month)
      const data = await executeQuery(expenseData, [user_data.month, bank]);
      return encrypt(
        {
          success: true,
          message: "Expense Data Passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          data: data,
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      return encrypt(
        {
          success: false,
          message: "Error in passing THe Expense Data",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async expenseOptionV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const cash = bankType(tokendata.cash);
      const category = await executeQuery(expenseCatageory);
      const bank = await executeQuery(getBank, [cash]);
      return encrypt(
        {
          success: true,
          message: "Expense Option passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          category: category,
          bank: bank,
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      return encrypt(
        {
          success: false,
          message: "Error in passing Expense Option Passing",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async expenseUpdateDataV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const data = await executeQuery(getExpenseData, [user_data.expenseId]);
      return encrypt(
        {
          success: true,
          message: "Expense Data Passed Successfully For Update the data",
          token: generateTokenWithoutExpire(token, true),
          data: data,
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      return encrypt(
        {
          success: false,
          message: "Error in passing Expense Data For Update",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async expenseUpdateV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const client: PoolClient = await getClient();

    try {
      await client.query("BEGIN");
      const data = await executeQuery(getExpenseHistoreyData, [
        user_data.expenseId,
      ]);

      if (user_data.bankId !== data[0].refBankId) {
        const paramsUpdateBankAmt = [
          data[0].refAmount,
          data[0].refBankId,
          CurrentTime(),
          "Admin",
        ];
        await client.query(updateBankAccountCreditQuery, paramsUpdateBankAmt);

        const paramsUpdateBankAmt2 = [
          user_data.amount,
          user_data.bankId,
          CurrentTime(),
          "Admin",
        ];
        await client.query(updateBankAccountDebitQuery, paramsUpdateBankAmt2);
      } else {
        if (user_data.amount > data[0].refAmount) {
          const balance = Number(user_data.amount) - Number(data[0].refAmount);
          const paramsUpdateBankAmt = [
            balance,
            user_data.bankId,
            CurrentTime(),
            "Admin",
          ];
          await client.query(updateBankAccountDebitQuery, paramsUpdateBankAmt);
        } else {
          const balance = Number(data[0].refAmount) - Number(user_data.amount);
          const paramsUpdateBankAmt = [
            balance,
            user_data.bankId,
            CurrentTime(),
            "Admin",
          ];
          await client.query(updateBankAccountCreditQuery, paramsUpdateBankAmt);
        }
      }

      let catId = user_data.categoryId;
      if (user_data.newCategory) {
        const result = await client.query(addCategory, [
          user_data.categoryName,
        ]);
        catId = result.rows[0].refExpenseCategoryId;
      }

      const params = [
        user_data.expenseDate,
        user_data.voucherNo,
        catId,
        user_data.subCategory,
        user_data.amount,
        user_data.bankId,
        CurrentTime(),
        tokendata.id,
        user_data.expenseId,
      ];

      const result = await client.query(updateExpense, params);
      const paramsLoanDebit = [
        user_data.bankId,
        formatYearMonthDate(CurrentTime()),
        "debit",
        user_data.amount,
        result.rows[0].refExpenseId,
        `${user_data.categoryName}`,
        7,
        CurrentTime(),
        "Admin",
        data[0].refBankFId,
      ];
      console.log("paramsLoanCredit", paramsLoanDebit);
      await client.query(updateFund, paramsLoanDebit);

      await client.query("COMMIT");
      return encrypt(
        {
          success: true,
          message: "Expense Data Passed Successfully For Update the data",
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
          message: "Error in passing Expense Data For Update",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }
}
