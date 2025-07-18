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
  addNewLoan,
  getBankQuery,
  getLoanList,
  getLoanType,
  getProductsDurationQuery,
  getRepaymentType,
  getUserList,
  insertRepaymentSchedule,
  updateBankAccountDebitQuery,
  updateBankFundQuery,
  updateLoan,
} from "./query";
import {
  calculateDueDate,
  convertToYMD,
  CurrentTime,
  formatDate_Time,
  formatDateMonthYear,
  formatYearMonthDate,
} from "../../helper/common";
import { ExtensionBalance, TopUpBalance } from "../../helper/LoanCalculation";

export class newLoanRepository {
  public async selectLoanV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const Loan = await executeQuery(getLoanList, [user_data.userId]);
      return encrypt(
        {
          success: true,
          message: "User Loan List",
          token: generateTokenWithoutExpire(token, true),
          data: Loan,
        },
        true
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
  public async userListOptionV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const userList = await executeQuery(getUserList, []);
      const loanType = await executeQuery(getLoanType);
      const rePaymentType = await executeQuery(getRepaymentType);

      return encrypt(
        {
          success: true,
          message: "Get The User List For Loan Creation",
          token: generateTokenWithoutExpire(token, true),
          data: userList,
          loanType: loanType,
          rePaymentType: rePaymentType,
        },
        true
      );
    } catch (error) {
      return encrypt(
        {
          success: false,
          message: "Error in Getting the User List",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async CreateNewLoanV1(user_data: any, tokendata?: any): Promise<any> {
    console.log("user_data line -------------- 57", user_data);
    const token = { id: tokendata.id, cash: tokendata.cash };
    const client: PoolClient = await getClient();

    try {
      await client.query("BEGIN");
      const productDetails = await executeQuery(getProductsDurationQuery, [
        user_data.refProductId,
      ]);
      console.log("productDetails", productDetails);
      const getBankAccount = await executeQuery(getBankQuery, [
        parseInt(user_data.refBankId),
      ]);
      const { refBalance } = getBankAccount[0];
      if (refBalance < user_data.refToUseAmt) {
        return encrypt(
          {
            success: false,
            message: "Insufficient balance in the bank.",
            token: generateTokenWithoutExpire(token, true),
          },
          true
        );
      }
      if (!productDetails || productDetails.length === 0) {
        throw new Error("Invalid Product ID. No duration found.");
      }

      const dueDate = calculateDueDate(
        user_data.refRepaymentStartDate,
        productDetails[0].refProductDuration,
        productDetails[0].refLoanDueType
      );
      console.log("dueDate", dueDate);

      const params = [
        user_data.refUserId,
        user_data.refProductId,
        user_data.refLoanAmount,
        dueDate,
        user_data.refPayementType,
        user_data.refRepaymentStartDate,
        convertToYMD(formatDate_Time(user_data.todayDate)),
        user_data.refBankId,
        user_data.refLoanBalance,
        user_data.isInterestFirst,
        formatDate_Time(user_data.todayDate),
        tokendata.id,
        user_data.refExLoanId,
        user_data.refLoanExt,
        user_data.refLoanStatus,
        user_data.refInterestMonthCount,
        user_data.refInitialInterest,
        user_data.refRepaymentType,
        user_data.refDocFee,
        user_data.refSecurity,
      ];
      console.log("params line ------ 106", params);
      const queryResult = await client.query(addNewLoan, params);
      console.log(" -> Line Number ----------------------------------- 152");
      const newLoanId = queryResult.rows[0].refLoanId;
      const custLoanId = queryResult.rows[0].refCustLoanId;
      const paramsLoanDebit = [
        user_data.refBankId,
        formatYearMonthDate(CurrentTime()),
        "debit",
        user_data.refLoanAmount,
        newLoanId,
        `Provide New Loan | ${custLoanId}`,
        1,
        CurrentTime(),
        "Admin",
      ];
      console.log("paramsLoanCredit", paramsLoanDebit);
      await client.query(updateBankFundQuery, paramsLoanDebit);

      if (user_data.refLoanExt === 2 || user_data.refLoanExt === 3) {
        console.log(" -> Line Number ----------------------------------- 121");
        let oldLoan;
        if (user_data.refLoanExt === 2) {
          oldLoan = await client.query(updateLoan, [
            user_data.refExLoanId,
            3,
            CurrentTime(),
            "Admin",
          ]);
        } else if (user_data.refLoanExt === 3) {
          oldLoan = await client.query(updateLoan, [
            user_data.refExLoanId,
            4,
            CurrentTime(),
            "Admin",
          ]);
        } else {
          console.log("Unknown Loan Type ");
        }

        const repaymentParams = [
          user_data.refExLoanId,
          formatDateMonthYear(CurrentTime()),
          oldLoan?.rows[0].refLoanAmount,
          user_data.oldBalanceAmt,
          0.0,
          "paid",
          "paid",
          CurrentTime(),
          tokendata.id,
        ];
        console.log("repaymentParams", repaymentParams);
        await client.query(insertRepaymentSchedule, repaymentParams);

        const fundDetails = [
          user_data.oldLoanBalance,
          formatYearMonthDate(CurrentTime()),
          "credit",
          user_data.oldBalanceAmt,
          user_data.refExLoanId,
          "fund",
          2,
          CurrentTime(),
          "Admin",
        ];
        await client.query(updateBankFundQuery, fundDetails);
      }
      const paramsLoanCredit = [
        user_data.refBankId,
        formatYearMonthDate(CurrentTime()),
        "credit",
        user_data.refTotalInterest,
        newLoanId,
        "fund",
        2,
        CurrentTime(),
        "Admin",
      ];
      console.log("paramsLoanCredit", paramsLoanCredit);
      await client.query(updateBankFundQuery, paramsLoanCredit);
      console.log(" -> Line Number ----------------------------------- 162");

      const paramsUpdateBankAmt = [
        user_data.refToUseAmt,
        user_data.refBankId,
        CurrentTime(),
        "Admin",
      ];
      console.log("paramsUpdateBankAmt", paramsUpdateBankAmt);
      const updateBalance = await client.query(
        updateBankAccountDebitQuery,
        paramsUpdateBankAmt
      );
      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "New Loan Created Successfully",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      console.log("error line ------ 168", error);
      await client.query("ROLLBACK");

      return encrypt(
        {
          success: false,
          message: "Error in Creating Loan",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async selectedLoanDetailsV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    let Balance;

    try {
      console.log("user_data line ---- 52", user_data);
      if (user_data.loanTypeId === 2) {
        Balance = await TopUpBalance(user_data.loanId);
      } else if (user_data.loanTypeId === 3) {
        Balance = await ExtensionBalance(user_data.loanId);
      }

      return encrypt(
        {
          success: true,
          message: "User Selected Loan Details Passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          data: Balance,
        },
        true
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
