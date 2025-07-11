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
  insertRepaymentSchedule,
  updateRepayment,
  getBankList,
  rePaymentData,
  settingData,
  getNextReDueId,
  rePaymentUpdate,
  storeLoanPayment,
  getDataOfReCalculate,
  generateReCalInterest,
  updateRePaymentSchedule,
  addFund,
  checkBalance,
} from "./query";
import { PoolClient } from "pg";

import bcrypt from "bcryptjs";
import {
  CurrentTime,
  formatToYearMonth,
  formatDate,
  formatYearMonthDate,
  formatDateMonthYear,
  replaceDayInDate,
} from "../../helper/common";
import { loanQuery } from "../admin/query";
import { loanReminderSend } from "../../helper/mailcontent";
import { getLoanClosingData, TopUpBalance } from "../../helper/LoanCalculation";

export class rePaymentRepository {
  public async unPaidUserListV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    try {
      const name = await executeQuery(nameQuery, [tokendata.id]);

      const Params = [
        user_data.ifMonth,
        user_data.startDate === ""
          ? formatDateMonthYear(CurrentTime())
          : user_data.startDate,
        user_data.endDate === ""
          ? formatDateMonthYear(CurrentTime())
          : user_data.endDate,
      ];
      // const Params = [true, "30-06-2025", "30-06-2025"];
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

  public async rePaymentCalculationV11(
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

      console.log("balanceAmt line ----- 89", balanceAmt);
      RepaymentDetails[0] = {
        ...RepaymentDetails[0],
        refBalanceAmt: Math.round(balanceAmt),
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

  public async rePaymentCalculationV1(
    user_data: any,
    tokendata: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);

    try {
      const balanceAmount = await getLoanClosingData(
        user_data.loanId,
        CurrentTime()
      );
      console.log("\n\nLoan Closing Balance Amount : ", balanceAmount, "\n\n");
      const params = [user_data.loanId, user_data.rePayId];
      console.log("params line ---- 81", params);
      let RepaymentDetails = await executeQuery(rePaymentCalculation, params);
      const balanceAmt =
        RepaymentDetails[0].refLoanAmount - RepaymentDetails[0].totalPrincipal;

      console.log("balanceAmt line ----- 89", balanceAmt);
      RepaymentDetails[0] = {
        ...RepaymentDetails[0],
        refBalanceAmt: Math.round(balanceAmt),
        loanClosingBalance: Math.round(balanceAmount),
      };

      const bankDetails = await executeQuery(getBankList);
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

  public async updateRePaymentV11(
    user_data: any,
    tokendata: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
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
      console.log(" -> Line Number ----------------------------------- 157");
      if (oldAmt[0].refPrincipal < user_data.priAmt) {
        console.log(" -> Line Number ----------------------------------- 159");

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
          paramsData[0].refProductDurationType,
          paramsData[0].refProductMonthlyCal,
        ];
        console.log("intCalParams line ---- 169", intCalParams);
        const IntData = await executeQuery(reInterestCal, intCalParams);
        console.log("IntData line ------- 159", IntData);

        console.log(
          "updateRepayment.rows[0].refLoanId",
          updateRepayment.rows[0].refLoanId
        );
        console.log("updateReInterestCal", updateReInterestCal);
        await client.query(updateReInterestCal, [
          JSON.stringify(IntData),
          updateRepayment.rows[0].refLoanId,
        ]);
        console.log(" -> Line Number ----------------------------------- 193");
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
          2

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
  public async updateRePaymentV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    const client: PoolClient = await getClient();

    console.log("user_data", user_data);
    try {
      await client.query("BEGIN");
      const rePaymentDatas = await executeQuery(rePaymentData, [
        user_data.rePayId,
      ]);
      const SettingData = await executeQuery(settingData, [8]);
      if (rePaymentDatas.length === 0) {
        throw new Error("Repayment Data Not Found");
      }

      const params = [
        user_data.rePayId,
        user_data.payDate,
        user_data.cashAmt,
        user_data.onlineAmt,
        user_data.paidTotalAmount,
        user_data.bankId,
        user_data.cashId,
        true,
        user_data.payDate,
        token.id,
      ];
      console.log("params", params);
      await client.query(storeLoanPayment, params);
      const oldAreasAmt = rePaymentDatas[0].refArears;
      const nextDueId = await executeQuery(getNextReDueId, [
        rePaymentDatas[0].refLoanId,
        user_data.rePayId,
      ]);
      const nextDueData = nextDueId[0];
      let updateParams = [];
      if (user_data.paidTotalAmount > oldAreasAmt) {
        console.log(" -> Line Number ----------------------------------- 383");
        const newArearsAmt = 0;
        const paidInterestAmt = rePaymentDatas[0].refInterest;
        const paidPrincipalAmt =
          SettingData[0].refSettingValue === 1
            ? user_data.paidTotalAmount -
              rePaymentDatas[0].refArears +
              rePaymentDatas[0].refPrincipal
            : rePaymentDatas[0].refPrincipal;
        updateParams = [
          user_data.rePayId,
          newArearsAmt,
          paidInterestAmt,
          paidPrincipalAmt,
          "paid",
          "paid",
          true,
        ];
        console.log("updateParams", updateParams);
        if (SettingData[0].refSettingValue === 2) {
          const balanceAmt =
            Number(user_data.paidTotalAmount) -
            Number(rePaymentDatas[0].refArears);
          console.log("balanceAmt", balanceAmt);
          const paidInterest =
            balanceAmt > Number(nextDueData.refInterest)
              ? Number(nextDueData.refInterest)
              : Number(nextDueData.refInterest) - balanceAmt;
          console.log("paidInterest", paidInterest);
          const paidPrincipal =
            balanceAmt > nextDueData.refInterest
              ? balanceAmt - Number(nextDueData.refInterest)
              : 0;
          console.log("paidPrincipal", paidPrincipal);
          const arearsAmt = Number(nextDueData.refArears) - balanceAmt;
          console.log("arearsAmt", arearsAmt);

          const nextDueParams = [
            nextDueData.refRpayId,
            arearsAmt,
            paidInterest,
            paidPrincipal,
            balanceAmt >= Number(nextDueData.refInterest) ? "paid" : "Pending",
            "Pending",
            false,
          ];
          console.log("nextDueParams", nextDueParams);
          await client.query(rePaymentUpdate, nextDueParams);
        }
      } else if (user_data.paidTotalAmount <= oldAreasAmt) {
        console.log(" -> Line Number ----------------------------------- 426");
        const newArearsAmt =
          user_data.paidTotalAmount === oldAreasAmt
            ? 0
            : Number(oldAreasAmt) - Number(user_data.paidTotalAmount);
        console.log("newArearsAmt", newArearsAmt);

        const interestCheck =
          Number(rePaymentDatas[0].refInterest) -
          Number(rePaymentDatas[0].refPaidInterest);
        console.log("interestCheck", interestCheck);
        const paidInterestAmt =
          interestCheck !== 0
            ? user_data.paidTotalAmount >= interestCheck
              ? Number(rePaymentDatas[0].refInterest)
              : Number(user_data.paidTotalAmount) - Number(interestCheck)
            : Number(rePaymentDatas[0].refInterest);
        console.log("paidInterestAmt", paidInterestAmt);
        const balanceAmt =
          interestCheck <= Number(user_data.paidTotalAmount)
            ? Number(user_data.paidTotalAmount) - interestCheck
            : 0;
        console.log("balanceAmt", balanceAmt);
        const balancePrincipal =
          Number(rePaymentDatas[0].refPrincipal) -
          Number(rePaymentDatas[0].refPaidPrincipal);
        console.log("balancePrincipal", balancePrincipal);
        const paidPrincipalAmt =
          balancePrincipal >= balanceAmt
            ? Number(rePaymentDatas[0].refPaidPrincipal) + balanceAmt
            : Number(rePaymentDatas[0].refPaidPrincipal);
        console.log("paidPrincipalAmt", paidPrincipalAmt);
        console.log("rePaymentDatas", rePaymentDatas);
        updateParams = [
          user_data.rePayId,
          newArearsAmt,
          paidInterestAmt,
          paidPrincipalAmt,
          Number(rePaymentDatas[0].refInterest) === paidInterestAmt
            ? "paid"
            : "Pending",
          Number(rePaymentDatas[0].refPrincipal) === paidPrincipalAmt
            ? "paid"
            : "Pending",
          Number(rePaymentDatas[0].refInterest) === paidInterestAmt &&
          Number(rePaymentDatas[0].refPrincipal) === paidPrincipalAmt
            ? true
            : false,
        ];
      } else {
        console.log(" -> Line Number ----------------------------------- 468");
        throw Error;
      }

      console.log("updateParams line ------ 469", updateParams);

      await client.query(rePaymentUpdate, updateParams);
      if (SettingData[0].refSettingValue === 1) {
        console.log(" -> Line Number ----------------------------------- 476");
        const getReCalData = await client.query(getDataOfReCalculate, [
          rePaymentDatas[0].refLoanId,
          rePaymentDatas[0].refPaymentDate,
        ]);
        const getData = getReCalData.rows[0];
        const intCalParams = [
          getData.BalanceAmt,
          getData.MonthDiff,
          getData.refProductInterest,
          getData.SameMonthDate,
          getData.refRePaymentType,
          getData.refProductDurationType,
          getData.refProductMonthlyCal,
        ];
        const intData = await client.query(generateReCalInterest, intCalParams);
        const reScheduleData = intData.rows[0];
        console.log("reScheduleData line ------- 487", reScheduleData);
        await client.query(updateRePaymentSchedule, [
          JSON.stringify(reScheduleData),
          rePaymentDatas[0].refLoanId,
        ]);
      }
      console.log(" -> Line Number ----------------------------------- 499");
      const paymentMethod = await executeQuery(settingData, [6]);
      console.log(" -> Line Number ----------------------------------- 501");
      if (paymentMethod[0].refSettingValue === 1) {
        console.log(" -> Line Number ----------------------------------- 503");
        const rePaymentAmt = await executeQuery(settingData, [7]);
        console.log(" -> Line Number ----------------------------------- 505");
        if (rePaymentAmt[0].refSettingValue === 1) {
          const bankId =
            rePaymentDatas[0].refAccountType === 1
              ? user_data.bankId
              : user_data.cashId;
          const fundParams = [
            bankId,
            formatYearMonthDate(user_data.payDate),
            "credit",
            user_data.paidTotalAmount,
            null,
            "Loan Due Repayment ",
            null,
            2,
            user_data.payDate,
            token.id,
          ];
          console.log("fundParams", fundParams);
          await client.query(addFund, fundParams);
          console.log(
            " -> Line Number ----------------------------------- 523"
          );
          const params3 = [
            user_data.paidTotalAmount,
            bankId,
            CurrentTime(),
            "Admin",
          ];
          await client.query(updateBankAccountBalanceQuery, params3);
        } else {
          console.log(
            " -> Line Number ----------------------------------- 534"
          );
          const fundParams1 = [
            user_data.bankId,
            formatYearMonthDate(user_data.payDate),
            "credit",
            user_data.onlineAmt,
            null,
            "Loan Due Repayment ",
            null,
            2,
            user_data.payDate,
            token.id,
          ];
          console.log("fundParams1", fundParams1);
          await client.query(addFund, fundParams1);
          console.log(
            " -> Line Number ----------------------------------- 547"
          );
          const params1 = [
            user_data.onlineAmt,
            user_data.bankId,
            CurrentTime(),
            "Admin",
          ];
          await client.query(updateBankAccountBalanceQuery, params1);
          const fundParams2 = [
            user_data.cashId,
            formatYearMonthDate(user_data.payDate),
            "credit",
            user_data.cashAmt,
            null,
            "Loan Due Repayment ",
            null,
            2,
            user_data.payDate,
            token.id,
          ];
          await client.query(addFund, fundParams2);
          const params2 = [
            user_data.cashAmt,
            user_data.cashId,
            CurrentTime(),
            "Admin",
          ];
          await client.query(updateBankAccountBalanceQuery, params2);
        }
      } else {
        console.log(" -> Line Number ----------------------------------- 568");
        const fundParams = [
          paymentMethod[0].refSettingValue === 2
            ? user_data.bankId
            : user_data.cashId,
          formatYearMonthDate(user_data.payDate),
          "credit",
          user_data.paidTotalAmount,
          null,
          "Loan Due Repayment ",
          null,
          2,
          user_data.payDate,
          token.id,
        ];
        await client.query(addFund, fundParams);
        const params1 = [
          user_data.paidTotalAmount,
          paymentMethod[0].refSettingValue === 2
            ? user_data.bankId
            : user_data.cashId,
          CurrentTime(),
          "Admin",
        ];
        await client.query(updateBankAccountBalanceQuery, params1);
      }
      console.log(" -> Line Number ----------------------------------- 590");
      const balance = await client.query(checkBalance, [
        rePaymentDatas[0].refLoanId,
      ]);

      const amt = balance.rows[0];

      if (amt === 0) {
        await client.query(updateLoan, [
          parseInt(rePaymentDatas[0].refLoanId),
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
    const token = { id: tokendata.id, cash: tokendata.cash };
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
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);

    try {
      let balanceAmount = 0;
      if (user_data.loanNo) {
        balanceAmount = await getLoanClosingData(
          user_data.loanNo,
          CurrentTime()
        );
      }

      console.log("balanceAmount", balanceAmount);
      console.log("user_data.loanId", user_data.loanId);
      const RepaymentDetails = await executeQuery(getLoanDetails, [
        user_data.loanId,
      ]);
      console.log("RepaymentDetails", RepaymentDetails);
      console.log(" -> Line Number ----------------------------------- 363");
      RepaymentDetails.map((Data, index) => {
        if (Data.refLoanStatus === "opened") {
          const balanceAmt = Data.refLoanAmount - Data.totalPrincipal;
          RepaymentDetails[index] = {
            ...RepaymentDetails[index],
            refBalanceAmt: balanceAmt,
            loanClosingBalance: Math.round(balanceAmount),
          };
        } else {
          RepaymentDetails[index] = {
            ...RepaymentDetails[index],
            refBalanceAmt: 0,
          };
        }
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
    const token = { id: tokendata.id, cash: tokendata.cash };
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
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);

    console.log("user_data", user_data);
    try {
      const bank = await executeQuery(bankData);
      console.log("user_data line ---- 873", user_data, "\n\n");
      let RepaymentDetails = await executeQuery(LoanDetails, [
        user_data.LoanId,
      ]);
      console.log("RepaymentDetails line ---- 466", RepaymentDetails);

      const balanceAmount = await getLoanClosingData(
        user_data.LoanId,
        user_data.date ?? CurrentTime()
      );
      console.log("balanceAmount", balanceAmount);

      RepaymentDetails.map((Data, index) => {
        RepaymentDetails[index] = {
          ...RepaymentDetails[index],
          refBalanceAmt: balanceAmount,
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
  public async payPrincipalAmtV12(
    user_data: any,
    tokendata: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    const client: PoolClient = await getClient();

    console.log("user_data", user_data);
    try {
      await client.query("BEGIN");
      const check = await executeQuery(checkLoanPaid, [
        user_data.LoanId,
        CurrentTime(),
      ]);
      if (Number(check[0].unpaid_count) !== 0) {
        return encrypt(
          {
            success: false,
            message:
              "The User Need to Paid " +
              check[0].unpaid_count +
              " Month Interest and Principal Amount",
            token: tokens,
          },
          true
        );
      } else {
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
          const result = await client.query(updateLoan, [
            parseInt(user_data.LoanId),
            2,
            CurrentTime(),
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
            CurrentTime(),
            tokendata.id,
          ];
          await client.query(insertRepaymentSchedule, repaymentParams);

          await client.query(updateRepayment, [
            user_data.LoanId,
            formatDateMonthYear(CurrentTime()),
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
            8
          ];
          await client.query(bankFundUpdate, FundUpdate);

          const params3 = [
            user_data.principalAmt,
            user_data.bankId,
            CurrentTime(),
            "Admin",
          ];
          console.log("params3", params3);
          await client.query(updateBankAccountBalanceQuery, params3);
        } else if (
          Number(loanDetails.finalBalanceAmt) > Number(user_data.principalAmt)
        ) {
          let paramsData = await executeQuery(getReCalParams, [
            user_data.LoanId,
            formatDateMonthYear(CurrentTime()),
          ]);

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
          const IntData = await executeQuery(reInterestCal, intCalParams);

          await client.query(updateReInterestCal, [
            JSON.stringify(IntData),
            user_data.LoanId,
          ]);

          const repaymentParams = [
            user_data.LoanId,
            formatDateMonthYear(CurrentTime()),
            paramsData[0].refLoanAmount,
            user_data.principalAmt,
            0.0,
            "paid",
            "paid",
            CurrentTime(),
            tokendata.id,
          ];
          await client.query(insertRepaymentSchedule, repaymentParams);

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
            8
          ];
          await client.query(bankFundUpdate, FundUpdate);

          const params3 = [
            user_data.principalAmt,
            user_data.bankId,
            CurrentTime(),
            "Admin",
          ];
          console.log("params3", params3);
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
  public async payPrincipalAmtV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    const client: PoolClient = await getClient();

    console.log("user_data", user_data);
    try {
      const todayDate = user_data.date ?? CurrentTime();
      console.log("todayDate", todayDate);
      await client.query("BEGIN");

      const finalBalanceAmt: number = await getLoanClosingData(
        user_data.LoanId,
        todayDate
      );
      console.log("finalBalanceAmt", finalBalanceAmt);
      if (Number(finalBalanceAmt) < Number(user_data.principalAmt)) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message:
              "The Paid loan Amount is higher the Loan Balance Amount [  ₹ " +
              finalBalanceAmt +
              "]",
            token: tokens,
          },
          true
        );
      } else if (Number(finalBalanceAmt) == Number(user_data.principalAmt)) {
        console.log(" -> Line Number ----------------------------------- 1132");
        const result = await client.query(updateLoan, [
          parseInt(user_data.LoanId),
          2,
          todayDate,
          "Admin",
        ]);
        const loanData = result.rows[0];
        const repaymentParams = [
          loanData.refLoanId,
          formatDateMonthYear(todayDate),
          loanData.refLoanAmount,
          user_data.principalAmt,
          0.0,
          "paid",
          "paid",
          0,
          user_data.principalAmt,
          true,
          todayDate,
          tokendata.id,
        ];
        await client.query(insertRepaymentSchedule, repaymentParams);

        await client.query(updateRepayment, [
          user_data.LoanId,
          formatDateMonthYear(todayDate),
        ]);

        const FundUpdate = [
          user_data.bankId,
          formatYearMonthDate(todayDate),
          "credit",
          user_data.principalAmt,
          user_data.LoanId,
          todayDate,
          tokendata.id,
          "fund",
          user_data.paymentType,
          8,
        ];
        await client.query(bankFundUpdate, FundUpdate);

        const params3 = [
          user_data.principalAmt,
          user_data.bankId,
          todayDate,
          "Admin",
        ];
        console.log("params3", params3);
        await client.query(updateBankAccountBalanceQuery, params3);
      } else if (Number(finalBalanceAmt) > Number(user_data.principalAmt)) {
        console.log(" -> Line Number ----------------------------------- 1184");
        const params = [user_data.LoanId, formatDateMonthYear(todayDate)];
        console.log("params", params);
        let paramsData = await executeQuery(getReCalParams, params);

        paramsData[0] = {
          ...paramsData[0],
          BalanceAmt:
            Number(paramsData[0].BalanceAmt) - Number(user_data.principalAmt),
        };
        console.log("paramsData", paramsData);

        const date = replaceDayInDate(
          paramsData[0].refRepaymentStartDate,
          paramsData[0].SameMonthDate
        );
        console.log("date", date);

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

        const IntData = await executeQuery(generateReCalInterest, intCalParams);
        console.log("IntData", IntData);

        await client.query(updateReInterestCal, [
          JSON.stringify(IntData),
          user_data.LoanId,
        ]);

        const repaymentParams = [
          user_data.LoanId,
          formatDateMonthYear(todayDate),
          paramsData[0].refLoanAmount,
          user_data.principalAmt,
          0.0,
          "paid",
          "paid",
          0,
          user_data.principalAmt,
          true,
          CurrentTime(),
          tokendata.id,
        ];
        await client.query(insertRepaymentSchedule, repaymentParams);

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
          8,
        ];
        await client.query(bankFundUpdate, FundUpdate);

        const params3 = [
          user_data.principalAmt,
          user_data.bankId,
          CurrentTime(),
          "Admin",
        ];
        console.log("params3", params3);
        await client.query(updateBankAccountBalanceQuery, params3);
      } else {
        console.log(" -> Line Number ----------------------------------- 519");
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
