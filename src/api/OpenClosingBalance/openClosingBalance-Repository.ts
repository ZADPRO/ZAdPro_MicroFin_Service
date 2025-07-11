import { CurrentTime } from "../../helper/common";
import { executeQuery } from "../../helper/db";
import { encrypt } from "../../helper/encrypt";
import logger from "../../helper/logger";
import {
  balanceCondationCheck,
  getMonthDatesWithInfo,
} from "../../helper/OpeningClosingBalance";
import { generateTokenWithoutExpire } from "../../helper/token";
import { calculateBalance, getLastMonthBalance } from "./query";

export interface FundBalance {
  Balance: string; // string because it's coming as a string (e.g., '6556')
  refFundTypeId: number;
  refFundTypeName: string;
}

require("isomorphic-fetch");

export class openClosingBalRepository {
  public async getDataV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata?.id, cash: tokendata?.cash };

    try {
      console.log('user_data', user_data)
      const startDate = user_data.startDate;
      const endDate = user_data.endDate;

      const condation: balanceCondationCheck = await getMonthDatesWithInfo(
        startDate,
        endDate,
        CurrentTime()
      );
      console.log('condation', condation)
      let OpeningBalance = 0;
      let calBalance: FundBalance[] | null = null;
     
        const previousMonthBalance = await executeQuery(getLastMonthBalance, [
          condation.previousMonthStart,
          condation.previousMonthEnd,
        ]);
        OpeningBalance = previousMonthBalance.length === 0 ? 0 : OpeningBalance + Number(previousMonthBalance[0].refClosingBalance);
        if (condation.isSameDate) {
          calBalance = await executeQuery(calculateBalance, [
            condation.inputDate,
            condation.endDate,
          ]);
          console.log('calBalance line ---------- 41', calBalance)
        }
        else {
          const params = [condation.startOfMonth, condation.previousDate];
          
          const getBalanceToCal = await executeQuery(calculateBalance, params);
          let income = getBalanceToCal.reduce((sum, data) => {
            if ([2, 3, 5, 8].includes(Number(data.refFundTypeId))) {
              return sum + Number(data.Balance || 0);
            }
            return sum;
          }, 0);
          
          let expenseOut = getBalanceToCal.reduce((sum, data) => {
            if ([1, 4, 7].includes(Number(data.refFundTypeId))) {
              return sum + Number(data.Balance || 0);
            }
            return sum;
          }, 0);

          OpeningBalance = (OpeningBalance + income) - expenseOut;
          
          calBalance = await executeQuery(calculateBalance, [
            condation.inputDate,
            condation.endDate,
          ]);
          
        }
        
      const finalIncome = calBalance.reduce((sum, data) => {
        if ([2, 3, 5, 8].includes(Number(data.refFundTypeId))) {
          return sum + Number(data.Balance || 0);
        }
        return sum;
      }, 0);

      const FinalExpense = calBalance.reduce((sum, data) => {
        if ([1,4,7].includes(Number(data.refFundTypeId))) {
          return sum + Number(data.Balance || 0);
        }
        return sum;
      }, 0);

      const ClossingBalance = (OpeningBalance + finalIncome) - FinalExpense;

      const returnData = {
        openingBalance: OpeningBalance,
        clossingBalance: ClossingBalance,
        FundDetails : calBalance
      };
     
      return encrypt(
        {
          success: true,
          message: "Opening and Closing Balance Data is PAssed Successfully",
          token: generateTokenWithoutExpire(token, true),
          data: returnData,
        },
        true
      );
    } catch (error) {
      const Message = "Error In Passing the Opening and Closing Balance Data";
      console.error(Message, error);
      logger.info(`\n\n ${Message} \n ${error} \n\n`);

      return encrypt(
        {
          success: false,
          message: Message,
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
}
