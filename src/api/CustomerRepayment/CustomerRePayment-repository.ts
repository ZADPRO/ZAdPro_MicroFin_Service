import { generateTokenWithoutExpire } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { executeQuery } from "../../helper/db";
import { CurrentTime, formatDateMonthYear } from "../../helper/common";
import { LoanDetails, nameQuery, rePaymentData, userList } from "./query";
import logger from "../../helper/logger";

export class CustomerRePaymentRepository {
  public async dashBoardCountV1(user_data: any, tokendata: any): Promise<any> {
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
      const userData = await executeQuery(userList, Params);

      return encrypt(
        {
          success: true,
          message: "Customer Repayment UnPaid List is   Passed",
          token: tokens,
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);
      const message = "error in getting customer unpaid loan details list";
      logger.error(`\n\n${message}\n\n`);
      return encrypt(
        {
          success: false,
          message: message,
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
      const params = [user_data.loanId, user_data.rePayId];
      const data = await executeQuery(LoanDetails, params);
      const LoanData = {
        refPaymentDate: data[0].refPaymentDate,
        refLoanAmount: data[0].refLoanAmount,
        refBalanceAmt:
          Number(data[0].refLoanAmount) -
          (Number(data[0].totalPrincipal) +
            Number(data[0].totalPrincipalInArears) +
            Number(data[0].loanAdvance)),
        refProductDuration: data[0].refProductDuration,
        refProductDurationType: data[0].refProductDurationType,
        refProductInterest: data[0].refProductInterest,
        refRepaymentTypeName: data[0].refRepaymentTypeName,
        isInterestFirst: data[0].isInterestFirst,
        refInterestMonthCount: data[0].refInterestMonthCount,
        refInitialInterest: data[0].refInitialInterest,
        refLoanStartDate: data[0].refLoanStartDate,
        refRepaymentStartDate: data[0].refRepaymentStartDate,
        refLoanDueDate: data[0].refLoanDueDate,
        totalInterest:
          Number(data[0].totalInterest) +
          Number(data[0].totalInterestPaidInAreas),
        totalPrincipal:
          Number(data[0].totalPrincipal) +
          Number(data[0].totalPrincipalInArears) +
          Number(data[0].loanAdvance),
        refProductMonthlyCal: data[0].refProductMonthlyCal,
        loanAdvance: data[0].loanAdvance,
      };

      return encrypt(
        {
          success: true,
          message: "Loan Details Passed Successfully",
          token: tokens,
          data: LoanData,
        },
        false
      );
    } catch (error) {
      console.log("Error:", error);
      const message = "error in Loan Details In Customer Repayment";
      logger.error(`\n\n${message}\n\n`);
      return encrypt(
        {
          success: false,
          message: message,
          token: generateTokenWithoutExpire(token, true),
        },
        false
      );
    }
  }
  public async rePaymentDataV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    try {
      const data = await executeQuery(rePaymentData, [user_data.rePayId]);
      return encrypt(
        {
          success: true,
          message: "Loan Re-Payment Details Passed Successfully",
          token: tokens,
          data: data,
        },
        false
      );
    } catch (error) {
      console.log("Error:", error);
      const message = "error in Sending the Customer Loan Re-Payment Details";
      logger.error(`\n\n${message}\n\n`);
      return encrypt(
        {
          success: false,
          message: message,
          token: generateTokenWithoutExpire(token, true),
        },
        false
      );
    }
  }
}
