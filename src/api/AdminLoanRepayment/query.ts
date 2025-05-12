export const userList = `SELECT
vd."refVendorName",
 vd."refVendorId" AS "refUserId",
 vd."refVendorMobileNo" AS "refUserMobileNo",
 vd."refAddress" AS "refUserAddress",
 rp."refPaymentDate",
 rp."refRpayId",
 rl."refLoanInterest" AS "refProductInterest",
 rl."refLoanDuration" AS "refProductDuration",
 rl."refLoanAmount",
 rl."refLoanId"
FROM
 adminLoan."refRepaymentSchedule" rp
 INNER JOIN adminloan."refLoan" rl ON CAST(rl."refLoanId" AS INTEGER) = rp."refLoanId"::integer
 INNER JOIN adminloan."refVendorDetails" vd ON CAST(vd."refVendorId" AS INTEGER) = rl."refVenderId"
WHERE
 (rp."refPrincipalStatus" = 'Pending' OR rp."refInterestStatus" = 'Pending')
 AND rl."refLoanStatus" = 1
 AND (
   $1 = FALSE
   AND rp."refPaymentDate" <= $3
   OR (
     $1 = TRUE
     AND rp."refPaymentDate" BETWEEN $2 AND $3
   )
 );`;

export const rePaymentCalculation = `SELECT
rp."refPaymentDate",
vd."refVendorName" AS "refProductName",
rl."refLoanAmount",
rl."refLoanInterest" AS "refProductInterest",
rl."refLoanDuration" AS "refProductDuration",
rl."isInterestFirst",
rl."refLoanStartDate",
rl."refRepaymentStartDate",
rl."refLoanDueDate",
rl."refInitialInterest",
rl."refInterestMonthCount",
rt."refRepaymentTypeName",
 rp."refInterest"::NUMERIC AS "InteresePay",
rp."refPrincipal"::NUMERIC,
rp."refPrincipalStatus",
rp."refInterestStatus",
ROUND(
  COALESCE(
    (
      SELECT
        SUM(CAST(rp2."refPrincipal" AS NUMERIC)) -- Cast to NUMERIC
      FROM
        adminloan."refRepaymentSchedule" rp2
      WHERE
        CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId"
        AND rp2."refPrincipalStatus" = 'paid'
    ),
    0
  )::NUMERIC
) AS "totalPrincipal",
ROUND(
  COALESCE(
    (
      SELECT
        SUM(CAST(rp2."refInterest" AS NUMERIC)) -- Cast to NUMERIC
      FROM
        adminloan."refRepaymentSchedule" rp2
      WHERE
        CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId" AND rp2."refInterestStatus" = 'paid'
    ),
    0
  )::NUMERIC
) AS "totalInterest",
ROUND(
  COALESCE(rl."refLoanDuration"::NUMERIC, 0) - COALESCE(
    (
      SELECT
        COUNT(*)
      FROM
        adminloan."refRepaymentSchedule" rp3
      WHERE
        CAST(rp3."refLoanId" AS INTEGER) = rl."refLoanId"
        AND rp3."refPrincipalStatus" = 'paid'
    ),
    0
  )::NUMERIC
) AS "refNewDuration"
FROM
adminloan."refLoan" rl
INNER JOIN adminloan."refRepaymentSchedule" rp ON CAST(rp."refLoanId" AS INTEGER) = rl."refLoanId"
LEFT JOIN adminloan."refVendorDetails" vd ON CAST (vd."refVendorId" AS INTEGER) = rl."refVenderId"::INTEGER
LEFT JOIN public."refRepaymentType" rt ON CAST (rt."refRepaymentTypeId" AS INTEGER) = rl."refRePaymentType"::INTEGER
WHERE
rl."refLoanId" = $1
AND rp."refRpayId" = $2;`;

export const bankList = `SELECT
b."refBankId",
b."refBankName",
b."refBankAccountNo",
b."refIFSCsCode",
b."refBalance",
b."refAccountType"
FROM
public."refBankAccounts" b

`;

export const getPriAmt = `SELECT
rs."refPrincipal"
FROM
adminloan."refRepaymentSchedule" rs
WHERE
rs."refRpayId" = $1`;

export const updateRePayment = `UPDATE adminloan."refRepaymentSchedule"
SET
  (
    "refPrincipal",
    "refInterest",
    "refPrincipalStatus",
    "refInterestStatus",
    "refRepaymentAmount",
    "updatedAt",
    "updatedBy"
  ) = ($1, $2, $3, $4, $5, $6, $7)
WHERE
  "refRpayId" = $8
RETURNING *;
`;

export const getReCalParams = `SELECT
l."refLoanAmount"::NUMERIC - ROUND(
  COALESCE(
    (
      SELECT
        SUM(
          CAST(NULLIF(rs."refPrincipal", 'null') AS NUMERIC)
        )
      FROM
        adminloan."refRepaymentSchedule" rs
      WHERE
        CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
        AND rs."refPrincipalStatus" = 'paid'
    ),
    0
  )::NUMERIC
) AS "BalanceAmt",
l."refLoanInterest" AS "refProductInterest",
(
  (
    EXTRACT(
      YEAR
      FROM
        TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD')
    ) - EXTRACT(
      YEAR
      FROM
        TO_DATE($2 || '-01', 'YYYY-MM-DD')
    )
  ) * 12
) + (
  EXTRACT(
    MONTH
    FROM
      TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD')
  ) - EXTRACT(
    MONTH
    FROM
      TO_DATE($2 || '-01', 'YYYY-MM-DD')
  )
) AS "MonthDiff",
TO_CHAR(
  TO_TIMESTAMP($2 || '-01', 'YYYY-MM-DD'),
  'DD/MM/YYYY, HH12:MI:SS AM'
) AS "SameMonthDate",
l."refRePaymentType"
FROM
adminloan."refLoan" l
LEFT JOIN adminloan."refRepaymentSchedule" rs ON CAST(l."refLoanId" AS INTEGER) = rs."refLoanId"::INTEGER
WHERE
l."refLoanId" = $1
GROUP BY
l."refLoanId",
l."refLoanDueDate"`;

export const reInterestCal = `WITH
  loan_data AS (
    SELECT
      $1::NUMERIC AS loan_amount,
      $2::INTEGER AS product_duration,
      $3::NUMERIC AS product_interest,
      (
        DATE_TRUNC('MONTH', $4::TIMESTAMP) + INTERVAL '1 month'
      ) AS repayment_start_date,
      $5::INTEGER AS repayment_type
  ),
  repayment_schedule AS (
    SELECT
      TO_CHAR(
        DATE_TRUNC('MONTH', ld.repayment_start_date) + (m.month_num - 1) * INTERVAL '1 month',
        'YYYY-MM'
      ) AS payment_month,
      ROUND(
        CASE
          WHEN ld.repayment_type = 3 THEN 0
          ELSE ld.loan_amount / ld.product_duration
        END,
        2
      ) AS refPrincipal,
      ROUND(
        CASE
          WHEN ld.repayment_type IN (1, 3) THEN (
            (
              (ld.loan_amount * (ld.product_interest * 12)) / 100
            ) / 365
          ) * EXTRACT(
            DAY
            FROM
              (
                DATE_TRUNC(
                  'MONTH',
                  ld.repayment_start_date + (m.month_num - 1) * INTERVAL '1 month'
                ) + INTERVAL '1 month' - INTERVAL '1 day'
              )
          )
          WHEN ld.repayment_type = 2 THEN (
            (
              (
                ld.loan_amount - (
                  (ld.loan_amount / ld.product_duration) * (m.month_num - 1)
                )
              ) * (ld.product_interest * 12)
            ) / 100
          ) / 365 * EXTRACT(
            DAY
            FROM
              (
                DATE_TRUNC(
                  'MONTH',
                  ld.repayment_start_date + (m.month_num - 1) * INTERVAL '1 month'
                ) + INTERVAL '1 month' - INTERVAL '1 day'
              )
          )
        END,
        2
      ) AS refInterest
    FROM
      loan_data ld
      CROSS JOIN generate_series(1, $2::INTEGER) AS m (month_num)
  )
SELECT
  *
FROM
  repayment_schedule;`;

export const updateReInterestCal = `UPDATE adminloan."refRepaymentSchedule" AS rrs
  SET
    "refPrincipal" = update_data.refPrincipal::TEXT,
    "refInterest" = update_data.refInterest::TEXT
  FROM (
    SELECT
      payment_month,
      refPrincipal,
      refInterest
    FROM
      jsonb_to_recordset($1::jsonb) AS x(
        payment_month TEXT,
        refPrincipal NUMERIC,
        refInterest NUMERIC
      )
  ) AS update_data
  WHERE
    rrs."refLoanId" = $2
    AND rrs."refPaymentDate" = update_data.payment_month;`;

export const getUserData = `SELECT
    *
  FROM
    adminloan."refVendorDetails" vd
    LEFT JOIN adminloan."refLoan" l ON CAST(l."refVenderId" AS INTEGER) = vd."refVendorId"
  WHERE
    l."refLoanId" = $1`;

export const bankFundUpdate = `INSERT INTO
  public."refBankFund" (
    "refBankId",
    "refbfTransactionDate",
    "refbfTrasactionType",
    "refbfTransactionAmount",
    "refTxnId",
    "createdAt",
    "createdBy",
    "refFundType",
    "refPaymentType"
  )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING
  *;`;

export const updateBankAccountBalanceQuery = `
UPDATE public."refBankAccounts" 
SET 
  "refBalance" = ("refBalance"::numeric - $1),
  "updatedAt" = $3, 
  "updatedBy" = $4
WHERE "refBankId" = $2
RETURNING "refBalance";
`;

export const getLoanBalance = `SELECT
COALESCE(
  SUM(
    CASE
      WHEN rs."refPrincipalStatus" = 'paid' THEN rs."refPrincipal"::numeric
      ELSE 0
    END
  ), 0
) AS "Total_Amount",
COALESCE(rl."refLoanAmount"::numeric, 0) -
COALESCE(
  SUM(
    CASE
      WHEN rs."refPrincipalStatus" = 'paid' THEN rs."refPrincipal"::numeric
      ELSE 0
    END
  ), 0
) AS "Balance_Amount"
FROM
adminloan."refRepaymentSchedule" rs
LEFT JOIN adminloan."refLoan" rl ON rl."refLoanId"::numeric = rs."refLoanId"::numeric
WHERE
rs."refLoanId"::numeric = $1
GROUP BY
rl."refLoanId", rl."refLoanAmount";`;

export const updateLoan = `UPDATE
  adminloan."refLoan"
SET
  ("refLoanStatus", "updatedAt", "updatedBy") = ($2, $3, $4)
WHERE
  "refLoanId" = $1
RETURNING
  *;`;

export const updateFollowUp = `INSERT INTO
  adminloan.refuserstatus (
    "refRpayId",
    "refMessage",
    "refNextDate",
    "updatedAt",
    "updatedBy"
  )
VALUES
  ($1, $2, $3, $4, $5)
RETURNING
  *`;

export const getData = `SELECT
  vd."refVendorId" AS "refUserId",
  l."refLoanId"
FROM
  adminloan."refVendorDetails" vd
  LEFT JOIN adminloan."refLoan" l ON CAST(l."refVenderId" AS INTEGER) = vd."refVendorId"
  LEFT JOIN adminloan."refRepaymentSchedule" rs ON CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
WHERE
  rs."refRpayId" = $1`;
