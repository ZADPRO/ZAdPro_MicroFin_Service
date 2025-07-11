import { encrypt } from "../../helper/encrypt";
import { generateTokenWithoutExpire } from "../../helper/token";
import axios from "axios";
import qs from "qs";
// import { Client } from "@microsoft/microsoft-graph-client";
require("isomorphic-fetch");

import { Client } from "minio";
import { createUploadUrl, getObjectUrl } from "../../helper/minIoStorage";
import { executeQuery } from "../../helper/db";
import { testQuery } from "./query";
import { CurrentTime } from "../../helper/common";
export class testingRepository {
  public async mailV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata?.id, cash: tokendata?.cash };

    try {
      // const accessToken = await getAccessToken();
      // await sendMail(accessToken);

      return encrypt(
        {
          success: true,
          message: "Emails sent successfully",
          token: generateTokenWithoutExpire(token, true),
        },
        false
      );
    } catch (error) {
      console.error("Error in mailV1:", error);

      return encrypt(
        {
          success: false,
          message: "Error sending email",
          token: generateTokenWithoutExpire(token, true),
        },
        false
      );
    }
  }

  public async GenerateURLV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata?.id, cash: tokendata?.cash };
    console.log(" -> Line Number ----------------------------------- 98");
    try {
      const data = await createUploadUrl(user_data.fileName, 15);
      console.log("data line ----- 102", data);
      return encrypt(
        {
          success: true,
          message: "URL generated successfully",
          token: generateTokenWithoutExpire(token, true),
          Url: data,
        },
        false
      );
    } catch (error) {
      console.error("Error generating URL:", error);

      return encrypt(
        {
          success: false,
          message: "Error generating the URL",
          token: generateTokenWithoutExpire(token, true),
        },
        false
      );
    }
  }
  public async GetFileUrlV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata?.id, cash: tokendata?.cash };
    console.log(" -> Line Number ----------------------------------- 98");
    try {
      const minioClient = new Client({
        endPoint: process.env.MINIO_ENDPOINT!,
        port: parseInt(process.env.MINIO_PORT!),
        useSSL: process.env.MINIO_USE_SSL === "true",
        accessKey: process.env.MINIO_ACCESS_KEY!,
        secretKey: process.env.MINIO_SECRET_KEY!,
      });

      const bucketName = process.env.MINIO_BUCKET!;
      const objectName = "image1.png";
      const expirySeconds = 35 * 60;

      const url = await minioClient.presignedUrl(
        "GET",
        bucketName,
        objectName,
        expirySeconds
      );

      return encrypt(
        {
          success: true,
          message: "URL generated successfully",
          token: generateTokenWithoutExpire(token, true),
          fileUrl: url,
        },
        false
      );
    } catch (error) {
      console.error("Error generating URL:", error);

      return encrypt(
        {
          success: false,
          message: "Error generating the URL",
          token: generateTokenWithoutExpire(token, true),
        },
        false
      );
    }
  }
  public async GetFileObjectUrlV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata?.id, cash: tokendata?.cash };
    console.log(" -> Line Number ----------------------------------- 98");

    try {
      const data = await executeQuery(testQuery, [23]);

type DueType = 1 | 2 | 3; // 1 = monthly, 2 = weekly, 3 = daily
type InterestCalcType = 1 | 2; // 1 = Daywise, 2 = Overall
type RepaymentType = 1 | 2 | 3; // 1 = Flat, 2 = Diminishing, 3 = Interest-Based
type LoanCloseType = 1 | 2;

interface LoanBalanceParams {
  LoanAmount: number;
  TotalPrincipalPaid: number;
  TotalInterestPaid: number;
  InitialInterest: number;
  InterestPaidFirstAmount: number;
  InterestPaidFirstMonthCount: number;
  LoanDuration: number;
  LoanInterest: number;
  LoanDueType: number;
  InterestCalculationType: number;
  RepaymentType: number;
  LoanRepaymentStartDate: string; // yyyy-mm-dd
  todayDate: string; // dd/mm/yyyy, hh:mi:ss am
  LoanCloseType: number;
}

function parseCustomDate(dateStr: string): Date {
  const [datePart, timePart] = dateStr.split(", ");
  const [dd, mm, yyyy] = datePart.split("/").map(Number);
  const [hhmmss, ampm] = timePart.split(" ");
  let [hh, mi, ss] = hhmmss.split(":").map(Number);
  if (ampm.toLowerCase() === "pm" && hh < 12) hh += 12;
  if (ampm.toLowerCase() === "am" && hh === 12) hh = 0;
  return new Date(yyyy, mm - 1, dd, hh, mi, ss);
}

function addDueDuration(start: Date, dueType: number, duration: number): Date {
  const result = new Date(start);
  if (dueType === 1) result.setMonth(result.getMonth() + duration); // Monthly
  else if (dueType === 2)
    result.setDate(result.getDate() + duration * 7); // Weekly
  else result.setDate(result.getDate() + duration); // Daily
  return result;
}

function calculateLoanBalance(params: LoanBalanceParams): number {
  const {
    LoanAmount,
    TotalPrincipalPaid,
    TotalInterestPaid,
    InitialInterest,
    InterestPaidFirstAmount,
    InterestPaidFirstMonthCount,
    LoanDuration,
    LoanInterest,
    LoanDueType,
    InterestCalculationType,
    RepaymentType,
    LoanRepaymentStartDate,
    todayDate,
    LoanCloseType,
  } = params;

  const today = parseCustomDate(todayDate);
  const startDate = new Date(LoanRepaymentStartDate);
  const endDate = addDueDuration(startDate, LoanDueType, LoanDuration);
  const totalDays = Math.max(
    1,
    Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
  );

  if (today < startDate) {
    // Loan hasn't started yet
    const daysUntilStart = Math.max(
      0,
      Math.floor((startDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    );
    const completedDays = totalDays - daysUntilStart;
    const perDayInterest =
      (LoanAmount * LoanInterest * LoanDuration) / 100 / totalDays;
    const usedInterest = perDayInterest * completedDays;
    const remainingInterest = Math.max(0, InitialInterest - usedInterest);
    const remainingPrincipal = Math.max(
      0,
      LoanAmount - TotalPrincipalPaid - remainingInterest
    );
    return parseFloat(remainingPrincipal.toFixed(2));
  }

  // Loan already started
  const elapsedDays = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
  );
  const interestPerDay =
    InterestCalculationType === 1
      ? (LoanAmount * LoanInterest * LoanDuration) / 100 / totalDays // Daywise
      : (LoanAmount * LoanInterest) / 100; // Overall

  const monthsElapsed =
    (today.getFullYear() - startDate.getFullYear()) * 12 +
    (today.getMonth() - startDate.getMonth());

  if (monthsElapsed < InterestPaidFirstMonthCount) {
    const dueDays =
      LoanCloseType === 1 ? elapsedDays : totalDays / LoanDuration;
    const dueInterest = interestPerDay * dueDays;
    const remainingInterest = Math.max(
      0,
      InterestPaidFirstAmount - dueInterest
    );
    const remainingPrincipal = Math.max(
      0,
      LoanAmount - TotalPrincipalPaid - remainingInterest
    );
    return parseFloat(remainingPrincipal.toFixed(2));
  }

  // After initial interest period
  const remainingPrincipal = LoanAmount - TotalPrincipalPaid;
  let remainingInterest = 0;

  if (RepaymentType === 1) {
    // Flat Loan
    const totalInterest = (LoanAmount * LoanInterest * LoanDuration) / 100;
    const interestPerDue = totalInterest / LoanDuration;
    const paidCount = Math.floor(
      TotalPrincipalPaid / (LoanAmount / LoanDuration)
    );
    const remainingCount = LoanDuration - paidCount;
    remainingInterest =
      interestPerDue *
      (LoanCloseType === 1 ? remainingCount : Math.ceil(remainingCount));
  } else if (RepaymentType === 2 || RepaymentType === 3) {
    // Diminishing or Interest-Based
    const principalForInterest = remainingPrincipal;

    if (InterestCalculationType === 1) {
      const interestDays = LoanCloseType === 1 ? elapsedDays : totalDays;
      remainingInterest =
        ((principalForInterest * LoanInterest) / 100) *
        (interestDays / totalDays);
    } else {
      const unitsRemaining =
        LoanDuration -
        Math.floor(TotalPrincipalPaid / (LoanAmount / LoanDuration));
      const interestPerUnit = (principalForInterest * LoanInterest) / 100;
      remainingInterest =
        interestPerUnit *
        (LoanCloseType === 1 ? unitsRemaining : Math.ceil(unitsRemaining));
    }
  }

  const balance = Math.max(0, remainingPrincipal + remainingInterest);
  return parseFloat(balance.toFixed(2));
}

      // --- Build input for calculation ---
      const passData: LoanBalanceParams = {
        LoanAmount: Number(data[0].refLoanAmount),
        TotalPrincipalPaid: Number(data[0].totalPrincipalPaid),
        TotalInterestPaid: Number(data[0].totalInterestPaid),
        InitialInterest: Number(data[0].refInitialInterest),
        InterestPaidFirstAmount: Number(data[0].interestPaidFirstAmount),
        InterestPaidFirstMonthCount: Number(data[0].refInterestMonthCount),
        LoanDuration: Number(data[0].refProductDuration),
        LoanInterest: Number(data[0].refProductInterest),
        LoanDueType: Number(data[0].refLoanDueType),
        InterestCalculationType: Number(data[0].refInterestCalType),
        RepaymentType: Number(data[0].refRePaymentType),
        LoanRepaymentStartDate: data[0].refRepaymentStartDate,
        todayDate: CurrentTime(),
        LoanCloseType: Number(data[0].refSettingValue),
      };
      console.log('passData', passData)

      const balance = calculateLoanBalance(passData);
      console.log("Calculated Loan Closure Balance:", balance);

      return encrypt(
        {
          success: true,
          message: "URL generated successfully",
          token: generateTokenWithoutExpire(token, true),
        },
        false
      );
    } catch (error) {
      console.error("Error generating URL:", error);

      return encrypt(
        {
          success: false,
          message: "Error generating the URL",
          token: generateTokenWithoutExpire(token, true),
        },
        false
      );
    }
  }
}
