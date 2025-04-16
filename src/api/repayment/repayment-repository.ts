import { generateTokenWithoutExpire } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { executeQuery, getClient } from "../../helper/db";
import { sendEmail } from "../../helper/mail";

import {
  userList,
  nameQuery,
  rePaymentCalculation,
  bankList,
  updateRePayment,
  bankFundUpdate,
  updateFollowUp,
  loanAudit,
  getLoanDetails,
  getMailDetails,
  updateBankAccountBalanceQuery,
  getLoanBalance,
  updateLoan,
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

export class rePaymentRepository {
  public async unPaidUserListV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id };
    const tokens = generateTokenWithoutExpire(token, true);
    try {
      const name = await executeQuery(nameQuery, [tokendata.id]);

      const Params = [
        user_data.ifMonth,
        user_data.startDate === ""
          ? formatToYearMonth(CurrentTime())
          : user_data.startDate,
        user_data.endDate === ""
          ? formatToYearMonth(CurrentTime())
          : user_data.endDate,
      ];
      const userData = await executeQuery(userList, Params);
      return encrypt(
        {
          success: true,
          message: "test data from Loan Unpaid User List",
          token: tokens,
          name: name,
          data: userData,
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
  public async rePaymentCalculationV1(
    user_data: any,
    tokendata: any
  ): Promise<any> {
    const token = { id: tokendata.id };
    const tokens = generateTokenWithoutExpire(token, true);

    try {
      const params = [user_data.loanId, user_data.rePayId];
      let RepaymentDetails = await executeQuery(rePaymentCalculation, params);
      const balanceAmt =
        RepaymentDetails[0].refLoanAmount - RepaymentDetails[0].totalPrincipal;
      const InteresePay =
        balanceAmt * (RepaymentDetails[0].refProductInterest / 100);

      RepaymentDetails[0] = {
        ...RepaymentDetails[0],
        refBalanceAmt: balanceAmt,
        refInteresePay:
          RepaymentDetails[0].isInterestFirst === true ? 0 : InteresePay,
      };

      if (RepaymentDetails[0].isInterestFirst) {
        RepaymentDetails[0] = {
          ...RepaymentDetails[0],
          totalInterest:
            (RepaymentDetails[0].refProductInterest / 100) *
            RepaymentDetails[0].refLoanAmount *
            RepaymentDetails[0].refProductDuration,
        };
      }
      const bankDetails = await executeQuery(bankList);

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
    const token = { id: tokendata.id };
    const tokens = generateTokenWithoutExpire(token, true);
    const client: PoolClient = await getClient();

    try {
      await client.query("BEGIN");
      const Params = [
        user_data.priAmt,
        user_data.interest,
        "paid",
        user_data.priAmt + user_data.interest,
        CurrentTime(),
        tokendata.id,
        user_data.rePayId,
      ];
      const updateRepayment = await client.query(updateRePayment, Params);

      const FundUpdate = [
        user_data.bankId,
        formatYearMonthDate(CurrentTime()),
        "credit",
        user_data.priAmt + user_data.interest,
        updateRepayment.rows[0].refRpayId,
        CurrentTime(),
        tokendata.id,
        "fund",
        user_data.paymentType,
      ];

      await client.query(bankFundUpdate, FundUpdate);

      const params3 = [
        user_data.priAmt + user_data.interest,
        user_data.bankId,
        CurrentTime(),
        "Admin",
      ];
      await client.query(updateBankAccountBalanceQuery, params3);
      const loanBalance = await executeQuery(getLoanBalance, [
        parseInt(updateRepayment.rows[0].refLoanId),
      ]);

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
      console.log("Error:", error);
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
    const token = { id: tokendata.id };
    const tokens = generateTokenWithoutExpire(token, true);

    try {
      const params = [
        user_data.rePayId,
        user_data.message,
        formatDate(user_data.nextDate),
        CurrentTime(),
        tokendata.id,
      ];
      await executeQuery(updateFollowUp, params);

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
  public async loanAuditV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id };
    const tokens = generateTokenWithoutExpire(token, true);

    try {
      const params = [user_data.loanId];
      const auditData = await executeQuery(loanAudit, params);

      return encrypt(
        {
          success: true,
          message: "Loan Audit Data Is Passed Successfully",
          token: tokens,
          data: auditData,
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);

      return encrypt(
        {
          success: false,
          message: "Error In Getting The Loan Audit Data",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async loanDetailsV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id };
    const tokens = generateTokenWithoutExpire(token, true);

    try {
      const params = [user_data.loanId];
      let RepaymentDetails = await executeQuery(getLoanDetails, params);
      RepaymentDetails.map((Data, index) => {
        const balanceAmt = Data.refLoanAmount - Data.totalPrincipal;
        RepaymentDetails[index] = {
          ...RepaymentDetails[index],
          refBalanceAmt: balanceAmt,
        };
      });

      return encrypt(
        {
          success: true,
          message: "Loan Details Passed Successfully",
          token: tokens,
          data: RepaymentDetails,
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);
      return encrypt(
        {
          success: false,
          message: "Error In Sending Loan Details",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async NotificationV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id };
    const tokens = generateTokenWithoutExpire(token, true);

    try {
      const userData = await executeQuery(getMailDetails, [CurrentTime()]);
      userData.map((data, index) => {
        const main = async () => {
          const mailOptions = {
            to: data.refUserEmail,
            subject: "Remainder For The Loan From ZAdpro Fin",
            html: loanReminderSend(data.refUserFname, data.refUserLname),
          };

          try {
            await sendEmail(mailOptions);
          } catch (error) {
            console.error("Failed to send email:", error);
          }
        };

        main().catch(console.error);
      });

      return encrypt(
        {
          success: true,
          message: "Notification Send Successfully",
          token: tokens,
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);
      return encrypt(
        {
          success: false,
          message: "Error In Sending Loan Details",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
}
