import { generateTokenWithoutExpire } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { executeQuery, getClient } from "../../helper/db";
import { sendEmail } from "../../helper/mail";

import { PoolClient } from "pg";

import bcrypt from "bcryptjs";
import {
  CurrentTime,
  formatToYearMonth,
  formatDate,
  formatYearMonthDate,
  convertToYMD,
  bankType,
  calculateDueDate,
  formatDateMonthYear,
  replaceDayInDate,
  formatDate_Time,
} from "../../helper/common";
import { loanQuery } from "../admin/query";
import { loanReminderSend } from "../../helper/mailcontent";
import {
  adminExtensionBalance,
  adminTopUpBalance,
  ExtensionBalance,
  TopUpBalance,
} from "../../helper/LoanCalculation";
import {
  addNewLoan,
  bankData,
  bankFundUpdate,
  checkLoanPaid,
  closingData,
  getAllBankAccountQuery,
  getBankQuery,
  getLoanDataOption,
  getLoanDataQuery,
  getLoanList,
  getReCalParams,
  insertRepaymentSchedule,
  loanAudit,
  loanList,
  loanRepaymaneAudit,
  reInterestCal,
  updateBankAccountBalanceQuery,
  updateBankAccountDebitQuery,
  updateBankFundQuery,
  updateCloseLoan,
  updateLoan,
  updateReInterestCal,
  updateRepayment,
  vendorList,
} from "./query";

export class adminLoanCreationRepository {
  public async vendorListV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    try {
      const vendor = await executeQuery(vendorList);
      return encrypt(
        {
          success: true,
          message: "Vendor List Passed Successfully",
          token: tokens,
          data: vendor,
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);
      return encrypt(
        {
          success: false,
          message: "error in passing the vendor list",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async selectLoanV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const Loan = await executeQuery(getLoanList, [user_data.userId]);
      return encrypt(
        {
          success: false,
          message: "Vendor Loan List",
          token: generateTokenWithoutExpire(token, true),
          data: Loan,
        },
        false
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      return encrypt(
        {
          success: false,
          message: "Error in Vendor Loan List",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async addLoanOptionV1(userData: any, tokendata: any): Promise<any> {
    console.log("userData", userData);
    const token = { id: tokendata.id, cash: tokendata.cash }; // Extract token ID

    try {
      const loanOption = await executeQuery(getLoanDataOption, [
        userData.userId,
      ]);
      console.log("loanOption line ----- 112", loanOption);
      return encrypt(
        {
          success: true,
          message: "Loan Option passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          data: loanOption,
        },
        true
      );
    } catch (error: any) {
      console.error("Error inserting loan details:", error);

      console.log("Repository return Responce");
      return encrypt(
        {
          success: false,
          message: "loan insertion failed",
          error: error.message || "An unknown error occurred",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async CreateNewLoanV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const client: PoolClient = await getClient();

    console.log("user_data line ----- 138", user_data);
    try {
      await client.query("BEGIN");
      const getBankAccount = await executeQuery(getBankQuery, [
        parseInt(user_data.refBankId),
      ]);

      console.log("getBankAccount line ----- 125", getBankAccount);
      if (getBankAccount.length < 0) {
        return encrypt(
          {
            success: false,
            message: "Select The Valid Bank Resource",
            token: generateTokenWithoutExpire(token, true),
          },
          true
        );
      }
      const dueDate = calculateDueDate(
        user_data.refRepaymentStartDate,
        user_data.refLoanDuration,
        user_data.refProductDurationType
      );
      console.log("dueDate", dueDate);

      const params = [
        user_data.refUserId,
        user_data.refLoanDuration,
        user_data.refLoanInterest,
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
        user_data.refProductDurationType,
        user_data.refProductMonthlyCal,
      ];
      console.log("params", params);
      const queryResult = await client.query(addNewLoan, params);
      console.log(" -> Line Number ----------------------------------- 160");
      const newLoanId = queryResult.rows[0].refLoanId;
      const custLoanId = queryResult.rows[0].refCustLoanId;
      const paramsLoanDebit = [
        user_data.refBankId,
        formatYearMonthDate(CurrentTime()),
        "credit",
        user_data.refLoanAmount,
        newLoanId,
        `New Loan Amount Credit | ${custLoanId}`,
        3,
        CurrentTime(),
        "Admin",
      ];
      console.log(" -> Line Number ----------------------------------- 173");
      console.log("paramsLoanCredit", paramsLoanDebit);
      await client.query(updateBankFundQuery, paramsLoanDebit);

      if (user_data.refLoanExt === 2 || user_data.refLoanExt === 3) {
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
          "debit",
          user_data.oldBalanceAmt,
          user_data.refExLoanId,
          "Admin Loan",
          4,
          CurrentTime(),
          "Admin",
        ];
        await client.query(updateBankFundQuery, fundDetails);
      }
      const paramsLoanCredit = [
        user_data.refBankId,
        formatYearMonthDate(CurrentTime()),
        "debit",
        user_data.refTotalInterest,
        newLoanId,
        "Admin Loan",
        4,
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
  public async getLoanV1(userData: any, tokendata: any): Promise<any> {
    console.log(" -> Line Number ----------------------------------- 157");
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id, cash: tokendata.cash }; // Extract token ID

    try {
      console.log("userData lin e----- 161", userData);
      const { userId } = userData;
      const getLoanData = await executeQuery(getLoanDataQuery, [userId]);

      const allBankAccountList = await executeQuery(getAllBankAccountQuery);

      console.log("Repository return Responce");
      return encrypt(
        {
          success: true,
          message: "Returned list of loan successfully",
          loanData: getLoanData,
          allBankAccountList: allBankAccountList,
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      console.log("Repository return Responce");
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
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
      console.log("user_data line --------------------- 317", user_data);
      if (user_data.loanTypeId === 2) {
        Balance = await adminTopUpBalance(user_data.loanId);
      } else if (user_data.loanTypeId === 3) {
        Balance = await adminExtensionBalance(user_data.loanId);
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
  public async allLoanV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const bank = bankType(tokendata.cash);
      const loan = await executeQuery(loanList, [bank]);
      return encrypt(
        {
          success: true,
          message: "Getting All Loan List",
          token: generateTokenWithoutExpire(token, true),
          data: loan,
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      return encrypt(
        {
          success: false,
          message: "Error in Getting Admin Loan List",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async loanAuditV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      let data = await executeQuery(loanAudit, [
        user_data.userId,
        user_data.loanId,
      ]);

      const calData: any = await adminTopUpBalance(user_data.loanId);

      data.map((Data, index) => {
        if (Data.refLoanStatus === "opened") {
          const balanceAmt = Data.refLoanAmount - Data.totalPrincipal;
          data[index] = {
            ...data[index],
            refBalanceAmt: balanceAmt,
          };
        } else {
          data[index] = {
            ...data[index],
            refBalanceAmt: 0,
          };
        }
      });

      return encrypt(
        {
          success: true,
          message: "Getting All Loan Details",
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
          message: "Error in Getting Admin Loan Audit",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async loanRePaymentAuditV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      console.log("user_data line ------- 417", user_data);
      const data = await executeQuery(loanRepaymaneAudit, [user_data.loanId]);
      console.log("data line --------- 419", data);

      return encrypt(
        {
          success: true,
          message: "Getting Loan repayment Audit",
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
          message: "Error in Getting Admin Loan Repayment Audit",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async loanCloseDataV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);

    try {

      console.log(" -> Line Number ----------------------------------- 507");
      const bank = await executeQuery(bankData);
      let RepaymentDetails = await executeQuery(closingData, [
        user_data.LoanId,
      ]);
      console.log("RepaymentDetails", RepaymentDetails);

      const calData: any = await adminTopUpBalance(
        user_data.LoanId,
        user_data.todayDate
      );
      console.log("calData", calData);

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
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    const client: PoolClient = await getClient();

    try {
      await client.query("BEGIN");
      const check = await executeQuery(checkLoanPaid, [
        user_data.LoanId,
        formatDate_Time(user_data.todayDate),
      ]);
      console.log("check line ---- 433", check);
      console.log("check[0].unpaid_count", check[0].unpaid_count);
      if (Number(check[0].unpaid_count) !== 0) {
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
        const loanDetails: any = await adminTopUpBalance(
          user_data.LoanId,
          user_data.todayDate
        );
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
          const result = await client.query(updateCloseLoan, [
            parseInt(user_data.LoanId),
            2,
            formatDate_Time(user_data.todayDate),
            "Admin",
          ]);

          const loanData = result.rows[0];
          const repaymentParams = [
            loanData.refLoanId,
            formatDateMonthYear(CurrentTime()),
            loanData.refLoanAmount,
            user_data.principalAmt,
            0.0,
            "paid",
            "paid",
            formatDate_Time(user_data.todayDate),
            tokendata.id,
          ];
          console.log("repaymentParams line -------- 538", repaymentParams);
          await client.query(insertRepaymentSchedule, repaymentParams);

          await client.query(updateRepayment, [
            user_data.LoanId,
            formatToYearMonth(formatDate_Time(user_data.todayDate)),
          ]);

          const FundUpdate = [
            user_data.bankId,
            formatYearMonthDate(formatDate_Time(user_data.todayDate)),
            "debit",
            user_data.principalAmt,
            user_data.LoanId,
            formatDate_Time(user_data.todayDate),
            tokendata.id,
            "Admin Loan Re-Pay",
            user_data.paymentType,
            4,
          ];
          await client.query(bankFundUpdate, FundUpdate);

          const params3 = [
            user_data.principalAmt,
            user_data.bankId,
            formatDate_Time(user_data.todayDate),
            "Admin",
          ];
          await client.query(updateBankAccountBalanceQuery, params3);
        } else if (
          Number(loanDetails.finalBalanceAmt) > Number(user_data.principalAmt)
        ) {
          let paramsData = await executeQuery(getReCalParams, [
            user_data.LoanId,
            formatToYearMonth(formatDate_Time(user_data.todayDate)),
          ]);
          console.log("paramsData line ----- 625", paramsData);

          paramsData[0] = {
            ...paramsData[0],
            BalanceAmt:
              Number(paramsData[0].BalanceAmt) - Number(user_data.principalAmt),
          };

          const date = replaceDayInDate(
            paramsData[0].refRepaymentStartDate,
            paramsData[0].SameMonthDate
          );

          const intCalParams = [
            paramsData[0].BalanceAmt,
            paramsData[0].MonthDiff,
            paramsData[0].refProductInterest,
            date,
            paramsData[0].refRePaymentType,
            paramsData[0].refProductDurationType,
            paramsData[0].refProductMonthlyCal,
          ];
          console.log("intCalParams", intCalParams);
          const IntData = await executeQuery(reInterestCal, intCalParams);
          console.log("IntData", IntData);
          console.log("user_data.refLoanId", user_data.LoanId);
          await client.query(updateReInterestCal, [
            JSON.stringify(IntData),
            user_data.LoanId,
          ]);

          const repaymentParams = [
            user_data.LoanId,
            formatDateMonthYear(formatDate_Time(user_data.todayDate)),
            paramsData[0].refLoanAmount,
            user_data.principalAmt,
            0.0,
            "paid",
            "paid",
            CurrentTime(),
            tokendata.id,
          ];
          console.log("repaymentParams line -------- 538", repaymentParams);
          await client.query(insertRepaymentSchedule, repaymentParams);

          const FundUpdate = [
            user_data.bankId,
            formatYearMonthDate(formatDate_Time(user_data.todayDate)),
            "debit",
            user_data.principalAmt,
            user_data.LoanId,
            formatDate_Time(user_data.todayDate),
            tokendata.id,
            "Admin Loan Repay",
            user_data.paymentType,
            4,
          ];
          await client.query(bankFundUpdate, FundUpdate);

          const params3 = [
            user_data.principalAmt,
            user_data.bankId,
            formatDate_Time(user_data.todayDate),
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
