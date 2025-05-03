import { CurrentTime, dayInterest } from "./common";
import { executeQuery } from "./db";

const getLoanData = `WITH
  "getData" AS (
    SELECT
      l."refLoanId",
      l."isInterestFirst",
      l."refInterestMonthCount",
      rp."refProductInterest",
      rp."refProductDuration",
      l."refLoanAmount",
      l."createdAt",
      l."refInitialInterest",
      l."refRepaymentStartDate",
      COUNT(
        CASE
          WHEN rs."refInterestStatus" = 'paid' THEN 1
        END
      ) AS "paidInterestCount",
      COUNT(
        CASE
          WHEN rs."refInterestStatus" = 'paid'
          AND rs."refPrincipalStatus" = 'paid' THEN 1
        END
      ) AS "paidLoanCount",
      ROUND(
        COALESCE(
          (
            SELECT
              SUM(CAST(rs."refPrincipal" AS NUMERIC))
            FROM
              public."refRepaymentSchedule" rs
            WHERE
              CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
              AND rs."refPrincipalStatus" = 'paid'
          ),
          0
        )::NUMERIC,
        2
      ) AS "totalPrincipal",
      ROUND(
        COALESCE(
          (
            SELECT
              SUM(CAST(rs."refInterest" AS NUMERIC))
            FROM
              public."refRepaymentSchedule" rs
            WHERE
              CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
              AND rs."refInterestStatus" = 'paid'
          ),
          0
        )::NUMERIC
      ) AS "totalInterest",
      ROUND(
        (
          COALESCE(l."refLoanAmount"::NUMERIC, 0)::NUMERIC * (
            COALESCE(rp."refProductInterest"::NUMERIC, 0)::NUMERIC / 100
          ) * COALESCE(l."refInterestMonthCount"::NUMERIC, 0)
        ),
        2
      ) AS "InterestFirst",
      CASE
        WHEN TO_CHAR(
          TO_TIMESTAMP(l."createdAt", 'DD/MM/YYYY, HH:MI:SS PM') AT TIME ZONE 'Asia/Kolkata',
          'MM/YYYY'
        ) = TO_CHAR(
          TO_TIMESTAMP($2, 'DD/MM/YYYY, HH:MI:SS PM') AT TIME ZONE 'Asia/Kolkata',
          'MM/YYYY'
        ) THEN true
        ELSE false
      END AS "same_Month"
    FROM
      public."refLoan" l
      LEFT JOIN public."refRepaymentSchedule" rs ON CAST(l."refLoanId" AS INTEGER) = rs."refLoanId"::NUMERIC
      LEFT JOIN public."refProducts" rp ON CAST(rp."refProductId" AS INTEGER) = l."refProductId"::NUMERIC
    WHERE
      l."refLoanId" = $1
    GROUP BY
      l."refLoanId",
      l."isInterestFirst",
      l."refInterestMonthCount",
      rp."refProductInterest",
      rp."refProductDuration",
      l."refLoanAmount"
  )
SELECT
  *,
  GREATEST(
    (
      (
        EXTRACT(
          YEAR
          FROM
            (TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'))
        ) * 12 + EXTRACT(
          MONTH
          FROM
            (TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'))
        )
      ) - (
        EXTRACT(
          YEAR
          FROM
            (ga."refRepaymentStartDate"::timestamp)
        ) * 12 + EXTRACT(
          MONTH
          FROM
            (ga."refRepaymentStartDate"::timestamp)
        )
      )
    ),
    0
  ) AS "month_difference",
  GREATEST(
    EXTRACT(
      DAY
      FROM
        (TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'))
    ),
    0
  ) AS "DayCount",
  GREATEST(
    EXTRACT(
      DAY
      FROM
        (
          DATE_TRUNC(
            'MONTH',
            TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')
          ) + INTERVAL '1 MONTH' - INTERVAL '1 day'
        )
    ),
    0
  ) AS "dayCountInMonth"
FROM
  "getData" ga;`;

const monthEqual = `SELECT
  CASE
    WHEN TO_CHAR(
      TO_TIMESTAMP($2, 'DD/MM/YYYY, HH:MI:SS AM'),
      'YYYY-MM'
    ) = rs."refPaymentDate" THEN true
    ELSE false
  END AS "check",rs."refInterest"
FROM
  public."refRepaymentSchedule" rs
WHERE
  rs."refLoanId"::INTEGER = $1
  AND rs."refInterestStatus" = 'paid'
ORDER BY
  rs."refPaymentDate" DESC
LIMIT
  1`;

const TotalPreMonthInterest = `SELECT
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(CAST(rs."refInterest" AS NUMERIC))
        FROM
          public."refRepaymentSchedule" rs
        WHERE
          CAST(rs."refLoanId" AS INTEGER) = $1
          AND rs."refInterestStatus" = 'paid'
      ),
      0
    )::NUMERIC,
    2
  ) AS "TotalInterest"
FROM
  public."refRepaymentSchedule" rs
WHERE
  rs."refLoanId"::INTEGER = $1
  AND TO_CHAR(
    TO_TIMESTAMP($2, 'DD/MM/YYYY, HH:MI:SS AM'),
    'YYYY-MM'
  ) > rs."refPaymentDate"
  LIMIT 1;`;

const getDayDefference = `SELECT
  (
    TO_DATE(TO_CHAR(TO_TIMESTAMP($2, 'DD/MM/YYYY, HH:MI:SS AM'), 'YYYY-MM-DD'), 'YYYY-MM-DD') 
    - l."refLoanStartDate"::DATE + 1
  )::INTEGER AS "daysDifference",

  (
    (
      DATE_TRUNC('MONTH', TO_TIMESTAMP($2, 'DD/MM/YYYY, HH:MI:SS AM')) + INTERVAL '1 MONTH' - INTERVAL '1 day'
    )::DATE
    - TO_DATE(TO_CHAR(TO_TIMESTAMP($2, 'DD/MM/YYYY, HH:MI:SS AM'), 'YYYY-MM-DD'), 'YYYY-MM-DD')
  )::INTEGER AS "monthEndDifference"
  
FROM
  public."refLoan" l
WHERE
  l."refLoanId" = $1;`;

const monthCheck = `SELECT
  TO_CHAR(
    TO_TIMESTAMP($2, 'DD/MM/YYYY, HH:MI:SS PM') AT TIME ZONE 'Asia/Kolkata',
    'MM/YYYY'
  ) = TO_CHAR(rl."refLoanDueDate"::DATE, 'MM/YYYY') AS "check"
FROM
  public."refLoan" rl
WHERE
  rl."refLoanId" = $1;`;

export const TopUpBalance = async (loanId: any) => {
  try {
    console.log("loanId", loanId);
    console.log("CurrentTime()", CurrentTime());
    const loanData = await executeQuery(getLoanData, [loanId, CurrentTime()]);
    console.log("loanData line ----- 206", loanData);
    let balanceAmt =
      loanData[0].refLoanAmount - parseInt(loanData[0].totalPrincipal);
    let ToMonthInterestPaid = loanData[0].paidInterestCount;
    let TotalInterestPaid = parseInt(loanData[0].totalInterest);
    console.log("TotalInterestPaid line ------ 222", TotalInterestPaid);
    let totalInitialInterest = parseInt(loanData[0].refInitialInterest);
    const dayInt: any = await dayInterest(
      parseInt(loanData[0].refLoanAmount),
      parseInt(loanData[0].refProductInterest)
    );
    if (loanData[0].isInterestFirst) {
      //Check Total Interest Paid is Greater Than the Interest Paid First Month
      if (
        parseInt(loanData[0].paidInterestCount) >
        loanData[0].refInterestMonthCount
      ) {
        // check the Condation if the Current Month is equal to Last Interest Paid Month
        const result = await executeQuery(monthEqual, [loanId, CurrentTime()]);

        const dayIntPaid = parseInt(loanData[0].DayCount) * dayInt;
        if (result[0].check) {
          const amt = parseInt(result[0].refInterest) - dayIntPaid;
          balanceAmt = balanceAmt - amt;
          TotalInterestPaid = TotalInterestPaid - amt;
          console.log("TotalInterestPaid line ----- 232", TotalInterestPaid);
        } else {
          balanceAmt = balanceAmt + dayIntPaid;
          TotalInterestPaid = 0;
          console.log("TotalInterestPaid line ----- 236", TotalInterestPaid);
          totalInitialInterest =
            totalInitialInterest - (totalInitialInterest - dayIntPaid);
        }
      } else {
        if (!loanData[0].same_Month) {
          const preMonInt = await executeQuery(TotalPreMonthInterest, [
            loanId,
            CurrentTime(),
          ]);
          console.log("preMonInt line ----- 251", preMonInt);
          console.log(
            "parseInt(loanData[0].DayCount) line ----- 247",
            parseInt(loanData[0].DayCount)
          );
          console.log("dayInt line ------ 247", dayInt);

          let IntAmt = parseInt(loanData[0].DayCount) * dayInt;
          console.log("IntAmt line ------ 248 here", IntAmt);

          IntAmt = IntAmt + parseInt(preMonInt[0].TotalInterest || 0);
          console.log("IntAmt line ----- 251 here", IntAmt);

          balanceAmt = balanceAmt - (TotalInterestPaid - IntAmt);

          TotalInterestPaid = IntAmt;
          console.log("TotalInterestPaid line ----- 254", TotalInterestPaid);
        } else {
          const intAmtResult = await executeQuery(getDayDefference, [
            loanId,
            CurrentTime(),
          ]);

          console.log(
            "intAmtResult[0].daysDifference line ----- 279",
            intAmtResult[0].daysDifference
          );
          console.log("dayInt line ----- 279", dayInt);
          let intAmt = dayInt * intAmtResult[0].daysDifference;
          console.log("intAmt line ----- here 280", intAmt);
          const extIntAmt = parseInt(loanData[0].refInitialInterest) - intAmt;
          balanceAmt =
            balanceAmt - (extIntAmt + parseInt(loanData[0].InterestFirst));
          TotalInterestPaid = intAmt;
          console.log("TotalInterestPaid line ----- 266", TotalInterestPaid);
        }
      }
    } else {
      const result = await executeQuery(monthEqual, [loanId, CurrentTime()]);
      const dayIntPaid = parseInt(loanData[0].DayCount) * dayInt;

      if (result[0].check) {
        const amt = parseInt(result[0].refInterest) - dayIntPaid;
        balanceAmt = balanceAmt - amt;
        TotalInterestPaid = TotalInterestPaid - amt;
        console.log("TotalInterestPaid line ----- 277", TotalInterestPaid);
      } else {
        balanceAmt = balanceAmt + dayIntPaid;
        TotalInterestPaid = TotalInterestPaid + dayIntPaid;
        console.log("TotalInterestPaid line ------ 281", TotalInterestPaid);
      }
    }

    const loanCalData = {
      totalLoanAmt: loanData[0].refLoanAmount,
      loanInterest: loanData[0].refProductInterest,
      loanDuration: loanData[0].refProductDuration,
      interestFirst: loanData[0].isInterestFirst,
      initialInterest: loanData[0].refInitialInterest,
      interestFirstMonth: loanData[0].refInterestMonthCount,
      totalPrincipal: loanData[0].totalPrincipal,
      totalInterest: loanData[0].totalInterest,
      totalInterestPaid: TotalInterestPaid,
      totalInitialInterest: totalInitialInterest,
      totalLoanPaidDuration: loanData[0].paidLoanCount,
      finalBalanceAmt: balanceAmt,
    };
    console.log("loanCalData line ----- 299", loanCalData);

    return loanCalData;
  } catch (error) {
    console.log("error line ----- 127", error);
    const loanCalData = {
      message: "Error in Calculating the Loan Balance",
    };
    return loanCalData;
  }
};

export const ExtensionBalance = async (loanId: any) => {
  const checkResult = await executeQuery(monthCheck, [loanId, CurrentTime()]);
  if (checkResult[0].check) {
    const loanData = await executeQuery(getLoanData, [loanId, CurrentTime()]);
    let balanceAmt =
      loanData[0].refLoanAmount - parseInt(loanData[0].totalPrincipal);
    let TotalInterestPaid = parseInt(loanData[0].totalInterest);
    const result = await executeQuery(monthEqual, [loanId, CurrentTime()]);
    const dayInt: any = await dayInterest(
      parseInt(loanData[0].refLoanAmount),
      parseInt(loanData[0].refProductInterest)
    );
    const dayIntPaid = parseInt(loanData[0].DayCount) * dayInt;

    if (result[0].check) {
      const amt = parseInt(result[0].refInterest) - dayIntPaid;
      balanceAmt = balanceAmt - amt;
      TotalInterestPaid = TotalInterestPaid - amt;
    } else {
      balanceAmt = balanceAmt + dayIntPaid;
      TotalInterestPaid = TotalInterestPaid + dayIntPaid;
    }
    const resultData = {
      totalLoanAmt: loanData[0].refLoanAmount,
      loanInterest: loanData[0].refProductInterest,
      loanDuration: loanData[0].refProductDuration,
      interestFirst: loanData[0].isInterestFirst,
      initialInterest: loanData[0].refInitialInterest,
      interestFirstMonth: loanData[0].refInterestMonthCount,
      totalPrincipal: loanData[0].totalPrincipal,
      totalInterest: loanData[0].totalInterest,
      totalInterestPaid: TotalInterestPaid,
      totalInitialInterest: loanData[0].refInitialInterest,
      totalLoanPaidDuration: loanData[0].paidLoanCount,
      finalBalanceAmt: balanceAmt,
    };
    return resultData;
  } else {
    const result = { error: "This is not You Due Month" };
    return result;
  }
};
