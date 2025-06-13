import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import { storeFile, viewFile, deleteFile } from "../../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithoutExpire } from "../../helper/token";

import {
  convertToYMD,
  CurrentTime,
  formatYearMonthDate,
} from "../../helper/common";
import {
  expenseData,
  listArea,
  loanStatus,
  monthlyReportAdminLoan,
  monthlyReportCustomer,
  overAllReport,
  overallReportAdminLoan,
  rePaymentType,
} from "./query";

export class ReportRepository {
  public async overAllReportOptionV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const rePayment = await executeQuery(rePaymentType);
      const status = await executeQuery(loanStatus);
      const areaList = await executeQuery(listArea);
      return encrypt(
        {
          success: true,
          message: "Overall Report Option Passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          rePayment: rePayment,
          status: status,
          areaList: areaList,
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      return encrypt(
        {
          success: false,
          message: "Error in Sending the Overall Report Option",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async overAllReportV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      console.log("user_data line ----- 53", user_data);

      let data;
      if (user_data.loanOption === 1) {
        const params = [
          user_data.rePaymentType,
          user_data.loanStatus,
          user_data.area,
        ];
        console.log("params", params);
        console.log(" -> Line Number ----------------------------------- 62");
        data = await executeQuery(overAllReport, params);
      } else {
        const params = [user_data.rePaymentType, user_data.loanStatus];
        console.log(" -> Line Number ----------------------------------- 65");
        data = await executeQuery(overallReportAdminLoan, params);
      }
      return encrypt(
        {
          success: true,
          message: "Overall Report Data Passed Successfully",
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
          message: "Error in Sending the Overall Report Data",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async monthlyReportV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      console.log("user_data", user_data);

      let data;
      if (user_data.loanOption === 1) {
        const params = [
          user_data.interest,
          user_data.principal,
          user_data.startDate,
          user_data.endDate,
          user_data.area,
        ];
        data = await executeQuery(monthlyReportCustomer, params);
      } else {
        const params = [
          user_data.interest,
          user_data.principal,
          user_data.startDate,
          user_data.endDate,
        ];
        data = await executeQuery(monthlyReportAdminLoan, params);
      }
      return encrypt(
        {
          success: true,
          message: "Monthly Report Data Passed Successfully",
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
          message: "Error in Sending the Overall Report Data",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async expenseReportV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const data = await executeQuery(expenseData, [user_data.month]);

      return encrypt(
        {
          success: true,
          message: "Monthly Report Data Passed Successfully",
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
          message: "Error in Sending the Overall Report Data",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
}
