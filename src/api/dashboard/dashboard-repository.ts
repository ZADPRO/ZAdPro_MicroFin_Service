import { generateTokenWithoutExpire } from "../../helper/token";
import { encrypt } from "../../helper/encrypt";
import { executeQuery, getClient } from "../../helper/db";
import { loanCount, paidLoan, loanNotPaid } from "./query";

export class refDashboardRepository {
  public async dashBoardCountV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id };
    const tokens = generateTokenWithoutExpire(token, true);
    try {
      console.log(" -> Line Number ----------------------------------- 11");
      const loanCountData = await executeQuery(loanCount, [user_data.month]);
      console.log(" -> Line Number ----------------------------------- 13");
      const paidLoanData = await executeQuery(paidLoan, [user_data.month]);
      console.log(" -> Line Number ----------------------------------- 15");
      let loanNotPaidData = await executeQuery(loanNotPaid, [user_data.month]);
      console.log(" -> Line Number ----------------------------------- 17");
      const balance =
        loanNotPaidData[0].total_loan_amount - loanNotPaidData[0].Paid_amount;
      console.log(" -> Line Number ----------------------------------- 20");
      const interest = (balance * (4 / 100)) / 10;
      console.log(" -> Line Number ----------------------------------- 22");
      loanNotPaidData[0] = {
        ...loanNotPaidData[0],
        balance_amt: balance,
        interest_amt: interest,
      };

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
