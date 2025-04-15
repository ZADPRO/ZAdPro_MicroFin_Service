import { generateTokenWithoutExpire } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { executeQuery, getClient } from "../../helper/db";
import { loanCount, paidLoan, loanNotPaid } from "./query";

export class refDashboardRepository {
  public async dashBoardCountV1(user_data: any, tokendata: any): Promise<any> {
    console.log("Repository Started");
    const token = { id: tokendata.id };
    const tokens = generateTokenWithoutExpire(token, true);
    try {
      const loanCountData = await executeQuery(loanCount, [user_data.month]);
      const paidLoanData = await executeQuery(paidLoan, [user_data.month]);
      let loanNotPaidData = await executeQuery(loanNotPaid, [
        user_data.month,
      ]);

      const balance = loanNotPaidData[0].total_loan_amount - loanNotPaidData[0].Paid_amount
      const interest = (balance * (4/100)/10)
      loanNotPaidData[0] = {...loanNotPaidData[0],balance_amt:balance,interest_amt:interest}

      return encrypt(
        {
          success: true,
          message: "Dashboard Count Passed Successfully",
          token: tokens,
          loanCount: loanCountData,
          paidLoan: paidLoanData,
          loanNotPaid: loanNotPaidData,
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
