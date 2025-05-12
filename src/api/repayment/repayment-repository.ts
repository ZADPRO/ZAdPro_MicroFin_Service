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
  getUserData,
  agentAudit,
  getPriAmt,
  getReCalParams,
  reInterestCal,
  updateReInterestCal,
  getData,
  checkLoanPaid,
  bankData,
  LoanDetails,
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
      console.log("Params", Params);
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
      console.log("params line ---- 81", params);
      let RepaymentDetails = await executeQuery(rePaymentCalculation, params);
      const balanceAmt =
        RepaymentDetails[0].refLoanAmount - RepaymentDetails[0].totalPrincipal;

      console.log("balanceAmt line ----- 89", balanceAmt);
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
    const token = { id: tokendata.id };
    const tokens = generateTokenWithoutExpire(token, true);
    const client: PoolClient = await getClient();

    try {
      await client.query("BEGIN");
      const oldAmt = await executeQuery(getPriAmt, [user_data.rePayId]);

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
      const updateRepayment = await client.query(updateRePayment, Params);
      console.log("updateRepayment line ----- 149", updateRepayment);

      if (oldAmt[0].refPrincipal < user_data.priAmt) {
        console.log(" -> Line Number ----------------------------------- 151");
        let paramsData = await executeQuery(getReCalParams, [
          updateRepayment.rows[0].refLoanId,
          updateRepayment.rows[0].refPaymentDate,
        ]);
        console.log("paramsData", paramsData);
        paramsData[0] = {
          ...paramsData[0],
          BalanceAmt:
            Number(paramsData[0].BalanceAmt) - Number(user_data.priAmt),
        };
        console.log("paramsData line ----------------- 161", paramsData);
        const intCalParams = [
          paramsData[0].BalanceAmt,
          paramsData[0].MonthDiff,
          paramsData[0].refProductInterest,
          paramsData[0].SameMonthDate,
          paramsData[0].refRePaymentType,
        ];
        console.log("intCalParams line ---- 169", intCalParams);
        const IntData = await executeQuery(reInterestCal, intCalParams);
        console.log("IntData line ------- 159", IntData);

        await client.query(updateReInterestCal, [
          JSON.stringify(IntData),
          updateRepayment.rows[0].refLoanId,
        ]);
      }

      const userData = await executeQuery(getUserData, [
        updateRepayment.rows[0].refLoanId,
      ]);

      console.log(" -> Line Number ----------------------------------- 169");

      const agentParams = [
        tokendata.id,
        userData[0].refUserId,
        updateRepayment.rows[0].refLoanId,
        updateRepayment.rows[0].refRpayId,
        null,
        user_data.paymentType,
        user_data.priAmt + user_data.interest,
        CurrentTime(),
        tokendata.id,
      ];

      console.log("agentParams", agentParams);
      await client.query(agentAudit, agentParams);
      console.log(" -> Line Number ----------------------------------- 185");
      if (user_data.paymentType === 1) {
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
      }

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
    const token = { id: tokendata.id };
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

      const agentParams = [
        tokendata.id,
        userData[0].refUserId,
        userData[0].refLoanId,
        user_data.rePayId,
        result.rows[0].refStatusId,
        null,
        null,
        CurrentTime(),
        tokendata.id,
      ];

      console.log("agentParams", agentParams);
      await client.query(agentAudit, agentParams);

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
  public async loanCloseDataV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id };
    const tokens = generateTokenWithoutExpire(token, true);

    console.log("user_data", user_data);
    try {
      const bank = await executeQuery(bankData);
      let RepaymentDetails = await executeQuery(LoanDetails, [
        user_data.LoanId,
      ]);

      const calData: any = await TopUpBalance(user_data.LoanId);

      RepaymentDetails.map((Data, index) => {
        const balanceAmt = calData.finalBalanceAmt;
        RepaymentDetails[index] = {
          ...RepaymentDetails[index],
          refBalanceAmt: balanceAmt,
        };
      });
      return encrypt(
        {
          success: true,
          message: "Notification Send Successfully",
          token: tokens,
          data: RepaymentDetails,
          bank: bank,
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
  public async payPrincipalAmtV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id };
    const tokens = generateTokenWithoutExpire(token, true);
    const client: PoolClient = await getClient();

    console.log("user_data", user_data);
    try {
      await client.query("BEGIN");
      const check = await executeQuery(checkLoanPaid, [
        user_data.LoanId,
        CurrentTime(),
      ]);
      console.log("check line ---- 433", check);
      console.log("check[0].unpaid_count", check[0].unpaid_count);
      if (Number(check[0].unpaid_count) !== 0) {
        console.log(" -> Line Number ----------------------------------- 436");
        return encrypt(
          {
            success: false,
            message:
              "The User Need to Paid" +
              check[0].unpaid_count +
              "Month Interest and Principal Amount",
            token: tokens,
          },
          true
        );
      } else {
        console.log(" -> Line Number ----------------------------------- 447");
        const loanDetails: any = await TopUpBalance(user_data.LoanId);
        if (
          Number(loanDetails.finalBalanceAmt) < Number(user_data.principalAmt)
        ) {
          await client.query("ROLLBACK");
          return encrypt(
            {
              success: false,
              message:
                "The Paid loan Amount is higher the Loan Balance Amount [  ₹ " +
                loanDetails.finalBalanceAmt +
                "]",
              token: tokens,
            },
            true
          );
        } else if (
          Number(loanDetails.finalBalanceAmt) == Number(user_data.principalAmt)
        ) {
          await client.query(updateLoan, [
            parseInt(user_data.LoanId),
            2,
            CurrentTime(),
            "Admin",
          ]);

          const FundUpdate = [
            user_data.bankId,
            formatYearMonthDate(CurrentTime()),
            "credit",
            user_data.principalAmt,
            user_data.LoanId,
            CurrentTime(),
            tokendata.id,
            "fund",
            user_data.paymentType,
          ];
          await client.query(bankFundUpdate, FundUpdate);

          const params3 = [
            user_data.principalAmt,
            user_data.bankId,
            CurrentTime(),
            "Admin",
          ];
          await client.query(updateBankAccountBalanceQuery, params3);
        } else if (
          Number(loanDetails.finalBalanceAmt) > Number(user_data.principalAmt)
        ) {
          let paramsData = await executeQuery(getReCalParams, [
            user_data.refLoanId,
            formatToYearMonth(CurrentTime()),
          ]);

          paramsData[0] = {
            ...paramsData[0],
            BalanceAmt:
              Number(paramsData[0].BalanceAmt) - Number(user_data.principalAmt),
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
          await client.query(updateReInterestCal, [
            JSON.stringify(IntData),
            user_data.refLoanId,
          ]);

          const FundUpdate = [
            user_data.bankId,
            formatYearMonthDate(CurrentTime()),
            "credit",
            user_data.principalAmt,
            user_data.LoanId,
            CurrentTime(),
            tokendata.id,
            "fund",
            user_data.paymentType,
          ];
          await client.query(bankFundUpdate, FundUpdate);

          const params3 = [
            user_data.principalAmt,
            user_data.bankId,
            CurrentTime(),
            "Admin",
          ];
          await client.query(updateBankAccountBalanceQuery, params3);
        } else {
          console.log(
            " -> Line Number ----------------------------------- 519"
          );
        }
        await client.query("COMMIT");
        return encrypt(
          {
            success: true,
            message: "Loan Principal Amount Paid Successfully",
            token: tokens,
          },
          true
        );
      }
    } catch (error) {
      console.log("Error:", error);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Error in Paying the Loan Principal Amount",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }
}
