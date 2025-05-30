import { generateTokenWithoutExpire } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { executeQuery, getClient } from "../../helper/db";
import {
  loanCount,
  paidLoan,
  loanNotPaid,
  adminLoanCount,
  adminPaidLoan,
  adminLoanNotPaid,
} from "./query";
import { bankType } from "../../helper/common";

export class refDashboardRepository {
  public async dashBoardCountV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    try {
      const bank = bankType(tokendata.cash);
      const loanCountData = await executeQuery(loanCount, [
        user_data.month,
        bank,
      ]);
      const paidLoanData = await executeQuery(paidLoan, [
        user_data.month,
        bank,
      ]);
      const loanNotPaidData = await executeQuery(loanNotPaid, [
        user_data.month,
        bank,
      ]);

      const adminLoanCountData = await executeQuery(adminLoanCount, [
        user_data.month,
        bank,
      ]);
      const adminPaidLoanData = await executeQuery(adminPaidLoan, [
        user_data.month,
      ]);
      const adminLoanNotPaidData = await executeQuery(adminLoanNotPaid, [
        user_data.month,
      ]);

      return encrypt(
        {
          success: true,
          message: "Dashboard Count Passed Successfully",
          token: tokens,
          loanCount: loanCountData,
          paidLoan: paidLoanData,
          loanNotPaid: loanNotPaidData,
          adminLoanCountData: adminLoanCountData,
          adminPaidLoanData: adminPaidLoanData,
          adminLoanNotPaidData: adminLoanNotPaidData,
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);

      return encrypt(
        {
          success: false,
          message: "Error in Getting The Dashboard Count",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
}
