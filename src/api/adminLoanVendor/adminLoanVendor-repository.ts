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
} from "../../helper/common";
import { loanQuery } from "../admin/query";
import { loanReminderSend } from "../../helper/mailcontent";
import { TopUpBalance } from "../../helper/LoanCalculation";
import { addVendor, updateVendor, vendorDetails, vendorList } from "./query";

export class adminLoanVendorRepository {
  public async addNewVendorV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    try {
      console.log("user_data", user_data);
      const params = [
        user_data.vendorName,
        user_data.mobileNo,
        user_data.emailId,
        user_data.vendorType,
        user_data.address,
        user_data.description,
        CurrentTime(),
        tokendata.id,
        JSON.stringify(user_data.vendorBank),
      ];
      await executeQuery(addVendor, params);
      return encrypt(
        {
          success: true,
          message: "New Vendor Details Stored Successfully",
          token: tokens,
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);
      return encrypt(
        {
          success: false,
          message: "Error In Storing New Vendor Details",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async updateVendorV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    try {
      const params = [
        user_data.refVendorId,
        user_data.vendorName,
        user_data.mobileNo,
        user_data.emailId,
        user_data.vendorType,
        user_data.address,
        user_data.description,
        CurrentTime(),
        tokendata.id,
        JSON.stringify(user_data.vendorBank),
      ];
      await executeQuery(updateVendor, params);
      return encrypt(
        {
          success: true,
          message: "Vendor Details Updated Successfully",
          token: tokens,
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);
      return encrypt(
        {
          success: false,
          message: "Error In Updating the Vendor Details",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async listV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    try {
      const data = await executeQuery(vendorList);
      return encrypt(
        {
          success: true,
          message: "Vendor List Passed Successfully",
          token: tokens,
          data: data,
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);
      return encrypt(
        {
          success: false,
          message: "Error In Passing Vendor List",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async detailsV1(user_data: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const tokens = generateTokenWithoutExpire(token, true);
    try {
      console.log("user_data line ----- 125", user_data);
      const data = await executeQuery(vendorDetails, [user_data.refVendorId]);
      console.log("data line ----- 126", data);
      return encrypt(
        {
          success: true,
          message: "Vendor Detail Passed Successfully",
          token: tokens,
          data: data[0].vendordata,
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);
      return encrypt(
        {
          success: false,
          message: "Error In Passing Vendor Details",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
}
