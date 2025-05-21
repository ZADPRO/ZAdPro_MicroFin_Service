import { generateTokenWithoutExpire } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { executeQuery, getClient } from "../../helper/db";
import { sendEmail } from "../../helper/mail";

import {
  bankFundUpdate,
  bankList,
  getData,
  getLoanBalance,
  getPriAmt,
  getReCalParams,
  getUserData,
  reInterestCal,
  rePaymentCalculation,
  updateBankAccountBalanceQuery,
  updateFollowUp,
  updateLoan,
  updateReInterestCal,
  updateRePayment,
  userList,
} from "./query";
import { PoolClient } from "pg";

import bcrypt from "bcryptjs";
import {
  CurrentTime,
  formatToYearMonth,
  formatDate,
  formatYearMonthDate,
} from "../../helper/common";
import { loanQuery } from "../admin/query";
import { loanReminderSend } from "../../helper/mailcontent";
import { TopUpBalance } from "../../helper/LoanCalculation";

export class AdminRePaymentRepository {
  public async unPaidUserListV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    try {
      const Params = [
        user_data.ifMonth,
        user_data.startDate === ""
          ? formatToYearMonth(CurrentTime())
          : user_data.startDate,
        user_data.endDate === ""
          ? formatToYearMonth(CurrentTime())
          : user_data.endDate,
      ];
      console.log("Params", Params);
      const userData = await executeQuery(userList, Params);
      return encrypt(
        {
          success: true,
          message: "Unpaid Loan is Passed Successfully",
          token: tokens,
          data: userData,
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);
      return encrypt(
        {
          success: false,
          message: "Error in Passing the Unpaid Loan LIst",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async rePaymentCalculationV1(
    user_data: any,
    tokendata: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);

    try {
      const params = [user_data.loanId, user_data.rePayId];
      console.log("params line ---- 81", params);
      let RepaymentDetails = await executeQuery(rePaymentCalculation, params);
      const balanceAmt =
        RepaymentDetails[0].refLoanAmount - RepaymentDetails[0].totalPrincipal;

      RepaymentDetails[0] = {
        ...RepaymentDetails[0],
        refBalanceAmt: balanceAmt,
      };

      const bankDetails = await executeQuery(bankList);
      console.log("RepaymentDetails", RepaymentDetails);

      return encrypt(
        {
          success: true,
          message: "repayment Calculation Data is Passed Successfully",
          token: tokens,
          data: RepaymentDetails,
          bank: bankDetails,
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);
      return encrypt(
        {
          success: false,
          message: "Data insertion failed. Please try again.",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async updateRePaymentV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    const client: PoolClient = await getClient();

    try {
      console.log("user_data", user_data);
      await client.query("BEGIN");
      const oldAmt = await executeQuery(getPriAmt, [user_data.rePayId]);
      console.log("oldAmt", oldAmt);

      const Params = [
        user_data.priAmt,
        user_data.interest,
        "paid",
        "paid",
        user_data.priAmt + user_data.interest,
        CurrentTime(),
        tokendata.id,
        user_data.rePayId,
      ];
      console.log("Params", Params);
      const updateRepayment = await client.query(updateRePayment, Params);
      console.log(" -> Line Number ----------------------------------- 138");
      if (oldAmt[0].refPrincipal < user_data.priAmt) {
        console.log(" -> Line Number ----------------------------------- 140");
        let paramsData = await executeQuery(getReCalParams, [
          updateRepayment.rows[0].refLoanId,
          updateRepayment.rows[0].refPaymentDate,
        ]);
        paramsData[0] = {
          ...paramsData[0],
          BalanceAmt:
            Number(paramsData[0].BalanceAmt) - Number(user_data.priAmt),
        };
        const intCalParams = [
          paramsData[0].BalanceAmt,
          paramsData[0].MonthDiff,
          paramsData[0].refProductInterest,
          paramsData[0].SameMonthDate,
          paramsData[0].refRePaymentType,
        ];
        console.log("intCalParams", intCalParams);
        const IntData = await executeQuery(reInterestCal, intCalParams);
        console.log("IntData line ------- 159", IntData);

        await client.query(updateReInterestCal, [
          JSON.stringify(IntData),
          updateRepayment.rows[0].refLoanId,
        ]);
      }

      console.log(" -> Line Number ----------------------------------- 167");
      const userData = await executeQuery(getUserData, [
        updateRepayment.rows[0].refLoanId,
      ]);
      console.log(" -> Line Number ----------------------------------- 171");
      const FundUpdate = [
        user_data.bankId,
        formatYearMonthDate(CurrentTime()),
        "debit",
        user_data.priAmt + user_data.interest,
        updateRepayment.rows[0].refRpayId,
        CurrentTime(),
        tokendata.id,
        userData[0].refVendorName,
        user_data.paymentType,
      ];
      await client.query(bankFundUpdate, FundUpdate);
      const params3 = [
        user_data.priAmt + user_data.interest,
        user_data.bankId,
        CurrentTime(),
        "Admin",
      ];
      console.log(" -> Line Number ----------------------------------- 190");
      await client.query(updateBankAccountBalanceQuery, params3);
      console.log(" -> Line Number ----------------------------------- 192");
      const loanBalance = await executeQuery(getLoanBalance, [
        parseInt(updateRepayment.rows[0].refLoanId),
      ]);
      console.log(" -> Line Number ----------------------------------- 196");
      const amt = parseInt(loanBalance[0].Balance_Amount) - user_data.priAmt;

      if (amt === 0) {
        await client.query(updateLoan, [
          parseInt(updateRepayment.rows[0].refLoanId),
          2,
          CurrentTime(),
          "Admin",
        ]);
      } else if (amt < 0) {
        throw new Error(
          "The principal amount is higher than the balance amount"
        );
      }

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "repayment Updated Successfully",
          token: tokens,
        },
        true
      );
    } catch (error: any) {
      console.log("Error: line ----- 235", error);
      await client.query("ROLLBACK");

      return encrypt(
        {
          success: false,
          message: "Error In Updating The Repayment",
          error: error?.message || "An unknown error occurred",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async updateFollowUpV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    const client: PoolClient = await getClient();

    try {
      const params = [
        user_data.rePayId,
        user_data.message,
        formatDate(user_data.nextDate),
        CurrentTime(),
        tokendata.id,
      ];
      const result = await client.query(updateFollowUp, params);

      const userData = await executeQuery(getData, [user_data.rePayId]);

      return encrypt(
        {
          success: true,
          message: "Follow Up Message Updated Successfully",
          token: tokens,
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);

      return encrypt(
        {
          success: false,
          message: "Error In Updating the Follow Up Message",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
}
