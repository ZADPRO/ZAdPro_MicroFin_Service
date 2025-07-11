export const userList1 = `SELECT
  u."refCustId",
  u."refUserFname",
  u."refUserLname",
  u."refUserId",
  rc."refUserMobileNo",
  rc."refUserAddress",
  rc."refUserDistrict",
  rc."refUserState",
  rc."refUserPincode",
  rp."refPaymentDate",
  rp."refRpayId",
  rpr."refProductName",
  rpr."refProductInterest",
  rpr."refProductDuration",
  rl."refLoanAmount",
  rl."refLoanId"
FROM
  public."refRepaymentSchedule" rp
  INNER JOIN public."refLoan" rl ON CAST(rl."refLoanId" AS INTEGER) = rp."refLoanId"::integer
  INNER JOIN public.users u ON CAST(u."refUserId" AS INTEGER) = rl."refUserId"
  INNER JOIN public."refProducts" rpr ON CAST(rpr."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
  INNER JOIN public."refCommunication" rc ON CAST(rc."refUserId" AS INTEGER) = u."refUserId"
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
export const userList2 = `  SELECT
    CASE
      WHEN (
        SELECT
          s."refSettingValue"
        FROM
          settings."refSettings" s
        WHERE
          s."refSettingId" = 1
      ) = 2 THEN ra."refAreaPrefix" || '/' || (u."refUserId"::NUMERIC + 10000)::text
      ELSE (u."refUserId"::NUMERIC + 10000)::text
    END AS "refCustId",
    u."refUserFname",
    u."refUserLname",
    u."refUserId",
    rc."refUserMobileNo",
    rc."refUserAddress",
    rc."refUserDistrict",
    rc."refUserState",
    rc."refUserPincode",
    rc."refUserCity",
    rc."refUserAreaId",
    rc."refUserTaluk",
    rp."refPaymentDate",
    rp."refRpayId",
    rpr."refProductName",
    rpr."refProductInterest",
    rpr."refProductDuration",
    rpr."refProductDurationType",
    rpr."refProductMonthlyCal",
    rl."refLoanAmount",
    rl."refLoanId",
    rr."refRName",
    ra."refAreaName"
  FROM
    public."refRepaymentSchedule" rp
    INNER JOIN public."refLoan" rl ON CAST(rl."refLoanId" AS INTEGER) = rp."refLoanId"::integer
    INNER JOIN public.users u ON CAST(u."refUserId" AS INTEGER) = rl."refUserId"
    INNER JOIN public."refProducts" rpr ON CAST(rpr."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
    INNER JOIN public."refCommunication" rc ON CAST(rc."refUserId" AS INTEGER) = u."refUserId"
    LEFT JOIN public."refArea" ra ON CAST(ra."refAreaId" AS INTEGER) = rc."refUserAreaId"
    LEFT JOIN public."refReference" rr ON CAST(rr."refUserId" AS INTEGER) = u."refUserId"
  WHERE
    (
      rp."refPrincipalStatus" = 'Pending'
      OR rp."refInterestStatus" = 'Pending'
    )
    AND rl."refLoanStatus" = 1
    AND (
      (
        $1 = false
        AND TO_DATE(rp."refPaymentDate", 'DD-MM-YYYY') <= TO_DATE($2, 'DD-MM-YYYY')
      )
      OR (
        $1 = true
        AND TO_DATE(rp."refPaymentDate", 'DD-MM-YYYY') BETWEEN TO_DATE($2, 'DD-MM-YYYY') AND TO_DATE($3, 'DD-MM-YYYY')
      )
    )
  ORDER BY
    TO_DATE(rp."refPaymentDate", 'DD-MM-YYYY') ASC;`;

export const userList = `SELECT
    CASE
      WHEN (
        SELECT
          s."refSettingValue"
        FROM
          settings."refSettings" s
        WHERE
          s."refSettingId" = 1
      ) = 2 THEN ra."refAreaPrefix" || '/' || (u."refUserId"::NUMERIC + 10000)::text
      ELSE (u."refUserId"::NUMERIC + 10000)::text
    END AS "refCustId",
    u."refUserFname",
    u."refUserLname",
    u."refUserId",
    rc."refUserMobileNo",
    rc."refUserAddress",
    rc."refUserDistrict",
    rc."refUserState",
    rc."refUserPincode",
    rc."refUserCity",
    rc."refUserAreaId",
    rc."refUserTaluk",
    rp."refPaymentDate",
    rp."refRpayId",
    rpr."refProductName",
    rpr."refProductInterest",
    rpr."refProductDuration",
    rpr."refLoanDueType" AS "refProductDurationType",
    rpr."refInterestCalType" AS "refProductMonthlyCal",
    rl."refLoanAmount",
    rl."refLoanId",
    rr."refRName",
    ra."refAreaName"
  FROM
    public."refRepaymentSchedule" rp
    INNER JOIN public."refLoan" rl ON CAST(rl."refLoanId" AS INTEGER) = rp."refLoanId"::integer
    INNER JOIN public.users u ON CAST(u."refUserId" AS INTEGER) = rl."refUserId"
    INNER JOIN public."refLoanProducts" rpr ON CAST (rpr."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
    INNER JOIN public."refCommunication" rc ON CAST(rc."refUserId" AS INTEGER) = u."refUserId"
    LEFT JOIN public."refArea" ra ON CAST(ra."refAreaId" AS INTEGER) = rc."refUserAreaId"
    LEFT JOIN public."refReference" rr ON CAST(rr."refUserId" AS INTEGER) = u."refUserId"
  WHERE
    (
      rp."refPrincipalStatus" = 'Pending'
      OR rp."refInterestStatus" = 'Pending'
    )
    AND rl."refLoanStatus" = 1
    AND (
      (
        $1 = false
        AND TO_DATE(rp."refPaymentDate", 'DD-MM-YYYY') <= TO_DATE($2, 'DD-MM-YYYY')
      )
      OR (
        $1 = true
        AND TO_DATE(rp."refPaymentDate", 'DD-MM-YYYY') BETWEEN TO_DATE($2, 'DD-MM-YYYY') AND TO_DATE($3, 'DD-MM-YYYY')
      )
    )
  ORDER BY
    TO_DATE(rp."refPaymentDate", 'DD-MM-YYYY') ASC;`;

export const nameQuery = `SELECT "refUserFname" , "refUserLname" FROM public."users" WHERE "refUserId" = $1
`;
// version v1
export const rePaymentCalculation1 = `SELECT
  rp."refPaymentDate",
  rl."refLoanAmount",
  rpr."refProductName",
  rpr."refProductInterest",
  rpr."refProductDuration",
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
  rpr."refProductDurationType",
  rpr."refProductMonthlyCal",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(CAST(rp2."refPrincipal" AS NUMERIC)) -- Cast to NUMERIC
        FROM
          public."refRepaymentSchedule" rp2
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
          public."refRepaymentSchedule" rp2
        WHERE
          CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId"
          AND rp2."refInterestStatus" = 'paid'
      ),
      0
    )::NUMERIC
  ) AS "totalInterest",
  ROUND(
    COALESCE(rpr."refProductDuration"::NUMERIC, 0) - COALESCE(
      (
        SELECT
          COUNT(*)
        FROM
          public."refRepaymentSchedule" rp3
        WHERE
          CAST(rp3."refLoanId" AS INTEGER) = rl."refLoanId"
          AND rp3."refPrincipalStatus" = 'paid'
      ),
      0
    )::NUMERIC
  ) AS "refNewDuration"
FROM
  public."refLoan" rl
  INNER JOIN public."refRepaymentSchedule" rp ON CAST(rp."refLoanId" AS INTEGER) = rl."refLoanId"
  INNER JOIN public."refProducts" rpr ON CAST(rpr."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
  LEFT JOIN public."refRepaymentType" rt ON CAST(rt."refRepaymentTypeId" AS INTEGER) = rl."refRePaymentType"::INTEGER
WHERE
  rl."refLoanId" = $1
  AND rp."refRpayId" = $2;`;

// version v2
export const rePaymentCalculation = `SELECT
  rs."refPaymentDate",
  rl."refLoanAmount",
  lp."refProductName",
  lp."refProductInterest",
  lp."refLoanDueType",
  lp."refProductDuration",
  lp."refInterestCalType",
  rl."isInterestFirst",
  rl."refLoanStartDate",
  rl."refRepaymentStartDate",
  rl."refLoanDueDate",
  rl."refInitialInterest",
  rl."refInterestMonthCount",
  rt."refRepaymentTypeName",
  rt."refRepaymentTypeId",
  rs."refPrincipal",
  rs."refInterest",
  rs."refPrincipalStatus",
  rs."refInterestStatus",
  rs."refRepaymentAmount",
  rs."refPaidInterest",
  rs."refPaidPrincipal",
  rs."redDueStatus",
  rs."refArears",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(CAST(rp2."refPaidPrincipal" AS NUMERIC)) -- Cast to NUMERIC
        FROM
          public."refRepaymentSchedule" rp2
        WHERE
          CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId"
      ),
      0
    )::NUMERIC
  ) AS "totalPrincipal",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(CAST(rp2."refPaidInterest" AS NUMERIC)) -- Cast to NUMERIC
        FROM
          public."refRepaymentSchedule" rp2
        WHERE
          CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId"
      ),
      0
    )::NUMERIC
  ) AS "totalInterest",
  ba."refAccountType"
FROM
  public."refLoan" rl
  LEFT JOIN public."refRepaymentSchedule" rs ON CAST(rs."refLoanId" AS INTEGER) = rl."refLoanId"
  LEFT JOIN public."refLoanAdvance" la ON CAST(la."refLoanId" AS INTEGER) = rl."refLoanId"
  LEFT JOIN public."refLoanProducts" lp ON CAST(lp."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
  LEFT JOIN public."refRepaymentType" rt ON CAST(rt."refRepaymentTypeId" AS INTEGER) = lp."refRePaymentType"
  LEFT JOIN public."refBankAccounts" ba ON CAST (ba."refBankId" AS INTEGER) = rl."refBankId"::INTEGER
WHERE
  rs."refLoanId"::INTEGER = $1
  AND rs."refRpayId" = $2`;

export const bankList = `SELECT
  b."refBankId",
  b."refBankName",
  b."refBankAccountNo",
  b."refIFSCsCode"
FROM
  public."refBankAccounts" b
WHERE
  b."refAccountType" = 1`;

export const getBankList = `SELECT
  ba."refBankId",
  ba."refBankName",
  ba."refBankAccountNo",
  ba."refBankAddress",
  ba."refBalance",
  ba."refAccountType",
  ba."refIFSCsCode"
FROM
  public."refBankAccounts" ba`;

export const updateRePayment = `UPDATE
  public."refRepaymentSchedule"
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
RETURNING
  *;`;

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
    "refPaymentType",
    "refFundTypeId"
  )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)
RETURNING
  *;`;

export const updateFollowUp = `INSERT INTO
  public.refuserstatus (
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

// Version v1

export const loanAudit1 = `SELECT
  rp."refRpayId" AS "RpayId",
  rp."refLoanId" AS "LoanId",
  rp."refPaymentDate" AS "Month",
  rp."refInterest" AS "Interest",
  rp."refPrincipal" AS "Principal",
  rp."refPrincipalStatus" AS "PrincipalStatus",
  rp."refInterestStatus" AS "InterestStatus",
  json_agg(
    json_build_object(
      'FollowId',
      us."refStatusId",
      'Message',
      us."refMessage",
      'date',
      us."refNextDate",
      'UpdateAt',
      us."updatedAt"
    )
  ) AS "followup"
FROM
  public."refRepaymentSchedule" rp
  LEFT JOIN public.refuserstatus us ON CAST(us."refRpayId" AS INTEGER) = rp."refRpayId"
WHERE
  rp."refLoanId"::INTEGER = $1
GROUP BY
  rp."refRpayId",
  rp."refLoanId",
  rp."refPaymentDate",
  rp."refInterest",
  rp."refPrincipal",
  rp."refPrincipalStatus",
  rp."refInterestStatus"
ORDER BY
  TO_DATE(rp."refPaymentDate", 'DD-MM-YYYY') ASC;`;

// Version v2

export const loanAudit = `SELECT
  rp."refRpayId" AS "RpayId",
  rp."refLoanId" AS "LoanId",
  rp."refPaymentDate" AS "Month",
  rp."refInterest" AS "Interest",
  rp."refPrincipal" AS "Principal",
  rp."refArears" AS "arearsAmt",
  rp."refPaidInterest"::NUMERIC AS "paidInterest",
  rp."refPaidPrincipal"::NUMERIC AS "paidPrincipal",
  rp."redDueStatus" AS "dueStatus",
  SUM(lp."refTotal"::NUMERIC) FILTER (
    WHERE
      lp."refApprove" IS TRUE
  ) AS "verifiedPaidAmount",
  SUM(lp."refTotal"::NUMERIC) FILTER (
    WHERE
      lp."refApprove" IS NOT TRUE
  ) AS "UnVerifiedPaidAmount",
  json_agg(
    json_build_object(
      'FollowId',
      us."refStatusId",
      'Message',
      us."refMessage",
      'date',
      us."refNextDate",
      'UpdateAt',
      us."updatedAt"
    )
  ) AS "followup"
FROM
  public."refRepaymentSchedule" rp
  LEFT JOIN public."refuserstatus" us ON CAST(us."refRpayId" AS INTEGER) = rp."refRpayId"
  LEFT JOIN public."refLoanPayment" lp ON CAST(lp."refRpayId" AS INTEGER) = rp."refRpayId"
WHERE
  rp."refLoanId"::INTEGER = $1
GROUP BY
  rp."refRpayId",
  rp."refLoanId",
  rp."refPaymentDate",
  rp."refInterest",
  rp."refPrincipal",
  rp."refArears"
ORDER BY
  TO_DATE(rp."refPaymentDate", 'DD-MM-YYYY') ASC;`;

export const getLoanDetails = `SELECT
rl."refLoanId",
rl."refCustLoanId",
  rl."refLoanAmount",
  rl."refCustLoanId",
  rpr."refProductName",
  rpr."refProductInterest",
  rpr."refProductDuration",
  rl."isInterestFirst",
  rl."refLoanStartDate",
  rl."refRepaymentStartDate",
  rl."refDocFee",
  rl."refSecurity",
  rl."refLoanDueDate",
  ls."refLoanStatus",
  rl."refInterestMonthCount",
  rl."refInitialInterest",
  rt."refRepaymentTypeName",
  rpr."refLoanDueType" AS "refProductDurationType",
  rpr."refInterestCalType" AS "refProductMonthlyCal",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(
            CAST(NULLIF(rp2."refPrincipal", 'null') AS NUMERIC)
          )
        FROM
          public."refRepaymentSchedule" rp2
        WHERE
          CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId" AND rp2."refPrincipalStatus" = 'paid'
      ),
      0
    )::NUMERIC
  ) AS "totalPrincipal",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(
            CAST(NULLIF(rp2."refInterest", 'null') AS NUMERIC)
          )
        FROM
          public."refRepaymentSchedule" rp2
        WHERE
          CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId" AND rp2."refInterestStatus" = 'paid'
      ),
      0
    )::NUMERIC
  ) AS "totalInterest"
FROM
  public."refLoan" rl
  INNER JOIN public."refRepaymentSchedule" rp ON CAST(rp."refLoanId" AS INTEGER) = rl."refLoanId"::INTEGER
  INNER JOIN public."refLoanProducts" rpr ON CAST(rpr."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
  INNER JOIN public."refLoanStatus" ls ON CAST (ls."refLoanStatusId" AS INTEGER) = rl."refLoanStatus"
  LEFT JOIN public."refRepaymentType" rt ON CAST (rt."refRepaymentTypeId" AS INTEGER) = rl."refRePaymentType"
WHERE
  rl."refUserId" = $1
GROUP BY
  rl."refLoanId",
  rpr."refProductName",
  rpr."refProductInterest",
  rpr."refProductDuration",
  ls."refLoanStatus",
  rt."refRepaymentTypeName",
  rpr."refLoanDueType",
  rpr."refInterestCalType"`;
export const LoanDetails = `SELECT
  rl."refLoanId",
  rl."refLoanAmount",
  rpr."refProductName",
  rpr."refProductInterest",
  rpr."refProductDuration",
  rl."isInterestFirst",
  rl."refLoanStartDate",
  rl."refRepaymentStartDate",
  rl."refLoanDueDate",
  ls."refLoanStatus",
  rl."refInterestMonthCount",
  rl."refInitialInterest",
  rt."refRepaymentTypeName",
  rpr."refLoanDueType" AS "refProductDurationType",
  rpr."refInterestCalType" AS "refProductMonthlyCal",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(
            CAST(NULLIF(rp2."refPaidPrincipal", 'null') AS NUMERIC)
          )
        FROM
          public."refRepaymentSchedule" rp2
        WHERE
          CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId"
      ),
      0
    )::NUMERIC
  ) AS "totalPrincipal",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(
            CAST(NULLIF(rp2."refPaidInterest", 'null') AS NUMERIC)
          )
        FROM
          public."refRepaymentSchedule" rp2
        WHERE
          CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId"
      ),
      0
    )::NUMERIC
  ) AS "totalInterest"
FROM
  public."refLoan" rl
  INNER JOIN public."refRepaymentSchedule" rp ON CAST(rp."refLoanId" AS INTEGER) = rl."refLoanId"::INTEGER
  INNER JOIN public."refLoanProducts" rpr ON CAST(rpr."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
  INNER JOIN public."refLoanStatus" ls ON CAST(ls."refLoanStatusId" AS INTEGER) = rl."refLoanStatus"
  LEFT JOIN public."refRepaymentType" rt ON CAST(rt."refRepaymentTypeId" AS INTEGER) = rl."refRePaymentType"
WHERE
  rl."refLoanId" = $1
GROUP BY
  rl."refLoanId",
  rpr."refProductName",
  rpr."refProductInterest",
  rpr."refProductDuration",
  ls."refLoanStatus",
  rt."refRepaymentTypeName",
  rpr."refLoanDueType",
  rpr."refInterestCalType"`;

export const getMailDetails = `SELECT 
u."refUserId",u."refUserFname",u."refUserLname",rc."refUserEmail"
FROM public."refRepaymentSchedule" rp
INNER JOIN public."refLoan" rl ON CAST (rl."refLoanId" AS INTEGER) = rp."refLoanId"::INTEGER
INNER JOIN public.users u ON CAST (u."refUserId" AS INTEGER) = rl."refUserId"
INNER JOIN public."refCommunication" rc ON CAST (rc."refUserId" AS INTEGER) = rl."refUserId"
WHERE rp."refPrincipalStatus" = 'Pending'
  AND TO_CHAR(TO_TIMESTAMP($1, 'DD/MM/YYYY, HH:MI:SS AM'), 'YYYY-MM') = rp."refPaymentDate";`;

export const updateBankAccountBalanceQuery = `
UPDATE public."refBankAccounts" 
SET 
  "refBalance" = ("refBalance"::numeric + $1),
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
  public."refRepaymentSchedule" rs
  LEFT JOIN public."refLoan" rl ON rl."refLoanId"::numeric = rs."refLoanId"::numeric
WHERE
  rs."refLoanId"::numeric = $1
GROUP BY
  rl."refLoanId", rl."refLoanAmount";`;
export const updateLoan = `UPDATE
  public."refLoan"
SET
  ("refLoanStatus", "updatedAt", "updatedBy") = ($2, $3, $4)
WHERE
  "refLoanId" = $1
RETURNING
  *;`;

export const agentAudit = `INSERT INTO
  public."refAgentAudit" (
    "refAgentId",
    "refUserId",
    "refLoanId",
    "refRePaymentId",
    "refFollowUpId",
    "refPaymentType",
    "refRepaymentAmt",
    "refCreateAt",
    "refCreateBy"
  )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

export const getUserData = `SELECT * FROM public.users u
  LEFT JOIN public."refLoan" l ON CAST (l."refUserId" AS INTEGER) = u."refUserId"
  WHERE l."refLoanId" = $1`;

export const getData = `SELECT
  u."refUserId",
  l."refLoanId"
FROM
  public.users u
  LEFT JOIN public."refLoan" l ON CAST(l."refUserId" AS INTEGER) = u."refUserId"
  LEFT JOIN public."refRepaymentSchedule" rs ON CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
WHERE
  rs."refRpayId" = $1`;

export const reInterestCal1 = `WITH
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
      ROUND(ld.loan_amount / ld.product_duration, 2) AS refPrincipal,
      ROUND(
        CASE
          WHEN ld.repayment_type = 1 THEN (
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

export const reInterestCal2 = `WITH
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

export const reInterestCal3 = `WITH
  loan_data AS (
    SELECT
      $1::NUMERIC AS loan_amount,
      $2::INTEGER AS product_duration,
      $3::NUMERIC AS product_interest,
      $4::TIMESTAMP AS loan_start_date,
      $5::INTEGER AS repayment_type,
      $6::INTEGER AS refProductDurationType,  
      $7::INTEGER AS refProductMonthlyCal  
  ),
  repayment_schedule AS (
    SELECT
      TO_CHAR(
        CASE
          WHEN ld.refProductDurationType = 1 THEN ld.loan_start_date + (m.num - 1) * INTERVAL '1 month'
          WHEN ld.refProductDurationType = 2 THEN ld.loan_start_date + (m.num - 1) * INTERVAL '1 week'
          WHEN ld.refProductDurationType = 3 THEN ld.loan_start_date + (m.num - 1) * INTERVAL '1 day'
        END,
        'DD-MM-YYYY'
      ) AS payment_date,
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
            (ld.loan_amount * (ld.product_interest * 12)) / 100
          ) * (
            CASE
              WHEN ld.refProductDurationType = 1 AND ld.refProductMonthlyCal = 1 THEN 
                EXTRACT(DAY FROM (
                  DATE_TRUNC('MONTH', ld.loan_start_date + (m.num - 1) * INTERVAL '1 month') 
                  + INTERVAL '1 month' - INTERVAL '1 day'
                )) / 365.0
              WHEN ld.refProductDurationType = 1 AND ld.refProductMonthlyCal = 2 THEN 
                1 / 12.0
              WHEN ld.refProductDurationType = 2 THEN 7 / 365.0
              WHEN ld.refProductDurationType = 3 THEN 1 / 365.0
            END
          )

          WHEN ld.repayment_type = 2 THEN (
            (
              ld.loan_amount - ((ld.loan_amount / ld.product_duration) * (m.num - 1))
            ) * (ld.product_interest * 12) / 100 / 365
          ) * 
          CASE
            WHEN ld.refProductDurationType = 1 THEN 30
            WHEN ld.refProductDurationType = 2 THEN 7
            WHEN ld.refProductDurationType = 3 THEN 1
          END
        END,
        2
      ) AS refInterest
    FROM
      loan_data ld
      CROSS JOIN generate_series(1, ld.product_duration) AS m (num)
  )
SELECT
  *
FROM
  repayment_schedule;`;

export const reInterestCal4 = `WITH
  loan_data AS (
    SELECT
      $1::NUMERIC AS loan_amount,
      $2::INTEGER AS product_duration,
      $3::NUMERIC AS product_interest,
      $4::TIMESTAMP AS loan_start_date,
      $5::INTEGER AS repayment_type,
      $6::INTEGER AS refProductDurationType,  
      $7::INTEGER AS refProductMonthlyCal  
  ),
  repayment_schedule AS (
    SELECT
      TO_CHAR(
        CASE
          WHEN ld.refProductDurationType = 1 THEN ld.loan_start_date + m.num * INTERVAL '1 month'
          WHEN ld.refProductDurationType = 2 THEN ld.loan_start_date + m.num * INTERVAL '1 week'
          WHEN ld.refProductDurationType = 3 THEN ld.loan_start_date + m.num * INTERVAL '1 day'
        END,
        'DD-MM-YYYY'
      ) AS payment_date,
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
            (ld.loan_amount * (ld.product_interest * 12)) / 100
          ) * (
            CASE
              WHEN ld.refProductDurationType = 1 AND ld.refProductMonthlyCal = 1 THEN 
                EXTRACT(DAY FROM (
                  DATE_TRUNC('MONTH', ld.loan_start_date + m.num * INTERVAL '1 month') 
                  + INTERVAL '1 month' - INTERVAL '1 day'
                )) / 365.0
              WHEN ld.refProductDurationType = 1 AND ld.refProductMonthlyCal = 2 THEN 
                1 / 12.0
              WHEN ld.refProductDurationType = 2 THEN 7 / 365.0
              WHEN ld.refProductDurationType = 3 THEN 1 / 365.0
            END
          )
          WHEN ld.repayment_type = 2 THEN (
            (
              ld.loan_amount - ((ld.loan_amount / ld.product_duration) * (m.num - 1))
            ) * (ld.product_interest * 12) / 100 / 365
          ) * 
          CASE
            WHEN ld.refProductDurationType = 1 THEN 30
            WHEN ld.refProductDurationType = 2 THEN 7
            WHEN ld.refProductDurationType = 3 THEN 1
          END
        END,
        2
      ) AS refInterest
    FROM
      loan_data ld
      CROSS JOIN generate_series(1, ld.product_duration) AS m (num)
  )
SELECT
  *
FROM
  repayment_schedule;
`;

export const reInterestCal = `WITH
  loan_data AS (
    SELECT
      $1::NUMERIC AS loan_amount,
      $2::INTEGER AS product_duration,
      $3::NUMERIC AS product_interest,
      TO_TIMESTAMP($4, 'DD/MM/YYYY, HH12:MI:SS AM') AS loan_start_date,
      $5::INTEGER AS repayment_type,
      $6::INTEGER AS refProductDurationType,
      $7::INTEGER AS refProductMonthlyCal
  ),
  repayment_schedule AS (
    SELECT
      TO_CHAR(
        CASE
          WHEN ld.refProductDurationType = 1 THEN ld.loan_start_date + (m.num * INTERVAL '1 month')
          WHEN ld.refProductDurationType = 2 THEN ld.loan_start_date + (m.num * INTERVAL '1 week')
          WHEN ld.refProductDurationType = 3 THEN ld.loan_start_date + (m.num * INTERVAL '1 day')
        END,
        'DD-MM-YYYY'
      ) AS payment_date,
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
            (ld.loan_amount * (ld.product_interest * 12)) / 100
          ) * (
            CASE
              WHEN ld.refProductDurationType = 1 AND ld.refProductMonthlyCal = 1 THEN 
                EXTRACT(DAY FROM (
                  DATE_TRUNC('MONTH', ld.loan_start_date + (m.num * INTERVAL '1 month')) 
                  + INTERVAL '1 month' - INTERVAL '1 day'
                )) / 365.0
              WHEN ld.refProductDurationType = 1 AND ld.refProductMonthlyCal = 2 THEN 
                1 / 12.0
              WHEN ld.refProductDurationType = 2 THEN 7 / 365.0
              WHEN ld.refProductDurationType = 3 THEN 1 / 365.0
            END
          )
          WHEN ld.repayment_type = 2 THEN (
            (
              ld.loan_amount - ((ld.loan_amount / ld.product_duration) * (m.num - 1))
            ) * (ld.product_interest * 12) / 100 / 365
          ) * 
          CASE
            WHEN ld.refProductDurationType = 1 THEN 30
            WHEN ld.refProductDurationType = 2 THEN 7
            WHEN ld.refProductDurationType = 3 THEN 1
          END
        END,
        2
      ) AS refInterest
    FROM
      loan_data ld
      CROSS JOIN generate_series(1, ld.product_duration) AS m (num)
  )
SELECT
  *
FROM
  repayment_schedule;
`;

export const updateReInterestCal = `UPDATE
  public."refRepaymentSchedule" AS rrs
SET
  "refPrincipal" = update_data."refprincipal",
  "refInterest" = update_data."refinterest",
  "refRepaymentAmount" = update_data."refinterest"::NUMERIC + update_data."refprincipal"::NUMERIC,
  "refArears" = update_data."refinterest"::NUMERIC + update_data."refprincipal"::NUMERIC
FROM
  (
    SELECT
      x."payment_date",
      x."refprincipal",
      x."refinterest"
    FROM
      jsonb_to_recordset($1::jsonb) AS x (
        "payment_date" TEXT,
        "refprincipal" TEXT,
        "refinterest" TEXT
      )
  ) AS update_data
WHERE
  rrs."refLoanId"::NUMERIC = $2::NUMERIC
  AND TO_DATE(rrs."refPaymentDate", 'DD-MM-YYYY') = TO_DATE(update_data."payment_date", 'DD-MM-YYYY');`;

  
export const getPriAmt = `SELECT
  rs."refPrincipal"
FROM
  public."refRepaymentSchedule" rs
WHERE
  rs."refRpayId" = $1`;

export const getReCalParams1 = `SELECT
  l."refLoanAmount"::NUMERIC - ROUND(
    COALESCE(
      (
        SELECT
          SUM(
            CAST(NULLIF(rs."refPrincipal", 'null') AS NUMERIC)
          )
        FROM
          public."refRepaymentSchedule" rs
        WHERE
          CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
          AND rs."refPrincipalStatus" = 'paid'
      ),
      0
    )::NUMERIC
  ) AS "BalanceAmt",
  rp."refProductInterest",
  EXTRACT(
  YEAR
  FROM
    AGE (
      l."refLoanDueDate"::DATE,
      TO_TIMESTAMP($2 || '-01', 'YYYY-MM-DD')
    )
) * 12 +
EXTRACT(
  MONTH
  FROM
    AGE (
      l."refLoanDueDate"::DATE,
      TO_TIMESTAMP($2 || '-01', 'YYYY-MM-DD')
    )
) - 1 AS "MonthDiff",
  TO_CHAR(
    TO_TIMESTAMP($2 || '-01', 'YYYY-MM-DD'),
    'DD/MM/YYYY, HH12:MI:SS AM'
  ) AS "SameMonthDate",
  l."refRePaymentType"
FROM
  public."refLoan" l
  LEFT JOIN public."refRepaymentSchedule" rs ON CAST(l."refLoanId" AS INTEGER) = rs."refLoanId"::INTEGER
  LEFT JOIN public."refProducts" rp ON CAST(rp."refProductId" AS INTEGER) = l."refProductId"::INTEGER
WHERE
  l."refLoanId" = $1
GROUP BY
  l."refLoanId",
  rp."refProductInterest",
  rp."refProductDuration",
  l."refLoanDueDate"`;

export const getReCalParams2 = `SELECT
  l."refLoanAmount",
  l."refLoanAmount"::NUMERIC - ROUND(
    COALESCE(
      (
        SELECT
          SUM(
            CAST(NULLIF(rs."refPrincipal", 'null') AS NUMERIC)
          )
        FROM
          public."refRepaymentSchedule" rs
        WHERE
          CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
          AND rs."refPrincipalStatus" = 'paid'
      ),
      0
    )::NUMERIC
  ) AS "BalanceAmt",
  rp."refProductInterest",
  rp."refProductDurationType",
  rp."refProductMonthlyCal",
  (
    (
      EXTRACT(
        YEAR
        FROM
          TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD')
      ) - EXTRACT(
        YEAR
        FROM
          DATE_TRUNC('month', TO_DATE($2, 'DD-MM-YYYY'))
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
        DATE_TRUNC('month', TO_DATE($2, 'DD-MM-YYYY'))
    )
  ) AS "MonthDiff",
  TO_CHAR(
    DATE_TRUNC('month', TO_DATE($2, 'DD-MM-YYYY')),
    'DD/MM/YYYY, HH12:MI:SS AM'
  ) AS "SameMonthDate",
  l."refRePaymentType"
FROM
  public."refLoan" l
  LEFT JOIN public."refRepaymentSchedule" rs ON CAST(l."refLoanId" AS INTEGER) = rs."refLoanId"::INTEGER
  LEFT JOIN public."refProducts" rp ON CAST(rp."refProductId" AS INTEGER) = l."refProductId"::INTEGER
WHERE
  l."refLoanId" = $1
GROUP BY
  l."refLoanId",
  rp."refProductInterest",
  rp."refProductDuration",
  l."refLoanDueDate",
  rp."refProductDurationType",
  rp."refProductMonthlyCal"`;

export const getReCalParams3 = `SELECT
  l."refLoanAmount",
  l."refLoanAmount"::NUMERIC - ROUND(
    COALESCE(
      (
        SELECT
          SUM(
            CAST(NULLIF(rs."refPrincipal", 'null') AS NUMERIC)
          )
        FROM
          public."refRepaymentSchedule" rs
        WHERE
          CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
          AND rs."refPrincipalStatus" = 'paid'
      ),
      0
    )::NUMERIC
  ) AS "BalanceAmt",
  rp."refProductInterest",
  rp."refProductDurationType",
  rp."refProductMonthlyCal",
  (
    (
      EXTRACT(
        YEAR
        FROM
          TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD')
      ) - EXTRACT(
        YEAR
        FROM
          DATE_TRUNC('month', TO_DATE($2, 'DD-MM-YYYY'))
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
        DATE_TRUNC('month', TO_DATE($2, 'DD-MM-YYYY'))
    )
  ) AS "MonthDiff",
  TO_CHAR(
    TO_TIMESTAMP($2, 'DD-MM-YYYY'),
    'DD/MM/YYYY, HH12:MI:SS AM'
  ) AS "SameMonthDate",
  l."refRePaymentType"
FROM
  public."refLoan" l
  LEFT JOIN public."refRepaymentSchedule" rs ON CAST(l."refLoanId" AS INTEGER) = rs."refLoanId"::INTEGER
  LEFT JOIN public."refProducts" rp ON CAST(rp."refProductId" AS INTEGER) = l."refProductId"::INTEGER
WHERE
  l."refLoanId" = $1
GROUP BY
  l."refLoanId",
  rp."refProductInterest",
  rp."refProductDuration",
  l."refLoanDueDate",
  rp."refProductDurationType",
  rp."refProductMonthlyCal"`;

export const getReCalParamsV1 = `SELECT
  l."refLoanAmount",
  l."refRepaymentStartDate",
  l."refLoanAmount"::NUMERIC - ROUND(
    COALESCE(
      (
        SELECT
          SUM(
            CAST(NULLIF(rs."refPrincipal", 'null') AS NUMERIC)
          )
        FROM
          public."refRepaymentSchedule" rs
        WHERE
          CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
          AND rs."refPrincipalStatus" = 'paid'
      ),
      0
    )::NUMERIC
  ) AS "BalanceAmt",
  rp."refProductInterest",
  rp."refProductDurationType",
  rp."refProductMonthlyCal",
  CASE
    WHEN rp."refProductDurationType" = 1 THEN (
      DATE_PART(
        'year',
        AGE (
          TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD'),
          TO_DATE($2, 'DD-MM-YYYY')
        )
      ) * 12 + DATE_PART(
        'month',
        AGE (
          TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD'),
          TO_DATE($2, 'DD-MM-YYYY')
        )
      ) + CASE
        WHEN DATE_PART(
          'day',
          AGE (
            TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD'),
            TO_DATE($2, 'DD-MM-YYYY')
          )
        ) > 0 THEN 1
        ELSE 0
      END
    )
    WHEN rp."refProductDurationType" = 2 THEN CEIL(
      (
        TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD') - TO_DATE($2, 'DD-MM-YYYY')
      ) / 7.0
    )
    WHEN rp."refProductDurationType" = 3 THEN (
      TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD') - TO_DATE($2, 'DD-MM-YYYY')
    )
    ELSE 0
  END AS "MonthDiff",
  TO_CHAR(
    TO_TIMESTAMP($2, 'DD-MM-YYYY'),
    'DD/MM/YYYY, HH12:MI:SS AM'
  ) AS "SameMonthDate",
  l."refRePaymentType"
FROM
  public."refLoan" l
  LEFT JOIN public."refRepaymentSchedule" rs ON CAST(l."refLoanId" AS INTEGER) = rs."refLoanId"::INTEGER
  LEFT JOIN public."refProducts" rp ON CAST(rp."refProductId" AS INTEGER) = l."refProductId"::INTEGER
WHERE
  l."refLoanId" = $1
GROUP BY
  l."refLoanId",
  rp."refProductInterest",
  rp."refProductDuration",
  l."refLoanDueDate",
  rp."refProductDurationType",
  rp."refProductMonthlyCal"`;

export const getReCalParams = `SELECT
  l."refLoanAmount",
  l."refRepaymentStartDate",
  l."refLoanAmount"::NUMERIC - ROUND(
    COALESCE(
      (
        SELECT
          SUM(
            CAST(NULLIF(rs."refPaidPrincipal", 'null') AS NUMERIC)
          )
        FROM
          public."refRepaymentSchedule" rs
        WHERE
          CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
      ),
      0
    )::NUMERIC
  ) AS "BalanceAmt",
  rp."refProductInterest",
  rp."refLoanDueType" AS "refProductDurationType",
  rp."refInterestCalType" AS "refProductMonthlyCal",
  CASE
    WHEN rp."refLoanDueType" = 1 THEN (
      DATE_PART(
        'year',
        AGE (
          TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD'),
          TO_DATE($2, 'DD-MM-YYYY')
        )
      ) * 12 + DATE_PART(
        'month',
        AGE (
          TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD'),
          TO_DATE($2, 'DD-MM-YYYY')
        )
      ) + CASE
        WHEN DATE_PART(
          'day',
          AGE (
            TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD'),
            TO_DATE($2, 'DD-MM-YYYY')
          )
        ) > 0 THEN 1
        ELSE 0
      END
    )
    WHEN rp."refLoanDueType" = 2 THEN CEIL(
      (
        TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD') - TO_DATE($2, 'DD-MM-YYYY')
      ) / 7.0
    )
    WHEN rp."refLoanDueType" = 3 THEN (
      TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD') - TO_DATE($2, 'DD-MM-YYYY')
    )
    ELSE 0
  END AS "MonthDiff",
  TO_CHAR(
    TO_TIMESTAMP($2, 'DD-MM-YYYY'),
    'DD/MM/YYYY, HH12:MI:SS AM'
  ) AS "SameMonthDate",
  l."refRePaymentType"
FROM
  public."refLoan" l
  LEFT JOIN public."refRepaymentSchedule" rs ON CAST(l."refLoanId" AS INTEGER) = rs."refLoanId"::INTEGER
  LEFT JOIN public."refLoanProducts" rp ON CAST(rp."refProductId" AS INTEGER) = l."refProductId"::INTEGER
WHERE
  l."refLoanId" = $1
GROUP BY
  l."refLoanId",
  rp."refProductInterest",
  rp."refProductDuration",
  l."refLoanDueDate",
  rp."refLoanDueType",
  rp."refInterestCalType"`;

export const checkLoanPaid = `SELECT
  COALESCE(COUNT(*), 0) AS unpaid_count
FROM
  public."refLoan" l
  LEFT JOIN public."refRepaymentSchedule" rs 
    ON CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"::INTEGER
WHERE
  l."refLoanId" = $1
  AND TO_CHAR(
        TO_DATE(rs."refPaymentDate", 'YYYY-MM'),
        'YYYY-MM'
      ) BETWEEN TO_CHAR(
        TO_TIMESTAMP(l."refRepaymentStartDate", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
        'YYYY-MM'
      ) AND TO_CHAR(
        TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'),
        'YYYY-MM'
      )
  AND (rs."refPrincipalStatus" IS DISTINCT FROM 'paid' OR rs."refInterestStatus" IS DISTINCT FROM 'paid');`;

export const bankData = `SELECT
  b."refBankId",
  b."refBankName",
  b."refBankAccountNo",
  b."refIFSCsCode",
  bt."refAccountTypeName",
  b."refAccountType"
FROM
  public."refBankAccounts" b
  LEFT JOIN public."refBankAccountType" bt ON CAST(bt."refAccountId" AS INTEGER) = b."refAccountType"::INTEGER`;

export const insertRepaymentScheduleV1 = `INSERT INTO
  public."refRepaymentSchedule"(
    "refLoanId",
    "refPaymentDate",
    "refPaymentAmount",
    "refPrincipal",
    "refInterest",
    "refPrincipalStatus",
    "refInterestStatus",
    "createdAt",
    "createdBy")

values
  ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

export const insertRepaymentSchedule = `INSERT INTO public."refRepaymentSchedule" (
  "refLoanId",
  "refPaymentDate",
  "refPaymentAmount",
  "refPrincipal",
  "refInterest",
  "refPrincipalStatus",
  "refInterestStatus",
  "refPaidInterest",
  "refPaidPrincipal",
  "redDueStatus",
  "refRepaymentNumber",
  "createdAt",
  "createdBy"
)
VALUES (
  $1,                 -- refLoanId
  $2,                 -- refPaymentDate
  $3,                 -- refPaymentAmount
  $4,                 -- refPrincipal
  $5,                 -- refInterest
  $6,                 -- refPrincipalStatus
  $7,                 -- refInterestStatus
  $8,                 -- refPaidInterest
  $9,                 -- refPaidPrincipal
  $10,                -- redDueStatus
  (
    SELECT COUNT(*)
    FROM public."refRepaymentSchedule"
    WHERE "refLoanId" = $1
  ) + 1,              -- refRepaymentNumber
  $11,                -- createdAt
  $12                 -- createdBy
);`;

export const updateRepayment1 = `UPDATE public."refRepaymentSchedule"
SET
  "refPrincipal" = CASE
    WHEN "refPrincipalStatus" = 'Pending' THEN '0.00'
    ELSE "refPrincipal"
  END,
  "refInterest" = CASE
    WHEN "refInterestStatus" = 'Pending' THEN '0.00'
    ELSE "refInterest"
  END
WHERE
  "refLoanId"::INTEGER = $1
  AND "refPaymentDate" > $2;`;

export const updateRepayment = `UPDATE public."refRepaymentSchedule"
SET
  "refPrincipal" = CASE
    WHEN "refPrincipalStatus" = 'Pending' THEN '0'
    ELSE "refPrincipal"
  END,
  "refInterest" = CASE
    WHEN "refInterestStatus" = 'Pending' THEN '0'
    ELSE "refInterest"
  END
WHERE
  "refLoanId"::INTEGER = $1
  AND TO_DATE("refPaymentDate", 'DD-MM-YYYY') > TO_DATE($2, 'DD-MM-YYYY');
`;

export const rePaymentData = `SELECT
  rs.*,ba."refAccountType"
FROM
  public."refRepaymentSchedule" rs
  LEFT JOIN public."refLoan" l ON CAST (l."refLoanId" AS INTEGER) = rs."refLoanId"::INTEGER
  LEFT JOIN public."refBankAccounts" ba ON CAST (ba."refBankId" AS INTEGER) = l."refBankId"::INTEGER
WHERE
  rs."refRpayId" = $1`;

export const settingData = `SELECT
  *
FROM
  settings."refSettings"
WHERE
  "refSettingId" = $1`;

export const rePaymentUpdate = `UPDATE public."refRepaymentSchedule"
SET
  "refArears" = $2,
  "refPaidInterest" = $3,
  "refPaidPrincipal" = $4,
  "refPrincipalStatus" = $5,
  "refInterestStatus" = $6,
  "redDueStatus" = $7
WHERE
 "refRpayId" = $1`;

export const getNextReDueId = `WITH target_date AS (
  SELECT
    TO_DATE("refPaymentDate", 'DD-MM-YYYY') AS next_date
  FROM
    public."refRepaymentSchedule"
  WHERE
    "refLoanId"::INTEGER = $1
    AND "refRpayId" = $2
  LIMIT 1
),
next_repayment AS (
  SELECT
    rs.*
  FROM
    public."refRepaymentSchedule" rs,
    target_date td
  WHERE
    rs."refLoanId"::INTEGER = $1
    AND TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY') > td.next_date
  ORDER BY
    TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY')
  LIMIT 1
)
SELECT *
FROM next_repayment;`;

export const storeLoanPayment = `INSERT INTO
  public."refLoanPayment" (
    "refRpayId",
    "refPaymentDate",
    "refCash",
    "refOnline",
    "refTotal",
    "refBankId",
    "refCasId",
    "refApprove",
    "refCreateAt",
    "refCreateBy"
  )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

export const getDataOfReCalculate = `SELECT
  l."refLoanAmount",
  l."refRepaymentStartDate",
  l."refLoanAmount"::NUMERIC - ROUND(
    COALESCE(
      (
        SELECT
          SUM(
            CAST(NULLIF(rs."refPaidPrincipal", 'null') AS NUMERIC)
          )
        FROM
          public."refRepaymentSchedule" rs
        WHERE
          CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
      ),
      0
    )::NUMERIC
  ) AS "BalanceAmt",
  rp."refProductInterest",
  rp."refLoanDueType" AS "refProductDurationType",
  rp."refInterestCalType" AS "refProductMonthlyCal",
  CASE
    WHEN rp."refLoanDueType" = 1 THEN (
      DATE_PART(
        'year',
        AGE (
          TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD'),
          TO_DATE($2, 'DD-MM-YYYY')
        )
      ) * 12 + DATE_PART(
        'month',
        AGE (
          TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD'),
          TO_DATE($2, 'DD-MM-YYYY')
        )
      ) + CASE
        WHEN DATE_PART(
          'day',
          AGE (
            TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD'),
            TO_DATE($2, 'DD-MM-YYYY')
          )
        ) > 0 THEN 1
        ELSE 0
      END
    )
    WHEN rp."refLoanDueType" = 2 THEN CEIL(
      (
        TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD') - TO_DATE($2, 'DD-MM-YYYY')
      ) / 7.0
    )
    WHEN rp."refLoanDueType" = 3 THEN (
      TO_DATE(l."refLoanDueDate", 'YYYY-MM-DD') - TO_DATE($2, 'DD-MM-YYYY')
    )
    ELSE 0
  END AS "MonthDiff",
  TO_CHAR(
    TO_TIMESTAMP($2, 'DD-MM-YYYY'),
    'DD/MM/YYYY, HH12:MI:SS AM'
  ) AS "SameMonthDate",
  rp."refRePaymentType"
FROM
  public."refLoan" l
  LEFT JOIN public."refRepaymentSchedule" rs ON CAST(l."refLoanId" AS INTEGER) = rs."refLoanId"::INTEGER
  LEFT JOIN public."refLoanProducts" rp ON CAST (rp."refProductId" AS INTEGER) = l."refProductId"::INTEGER
WHERE
  l."refLoanId" = $1
GROUP BY
  l."refLoanId",
  rp."refProductInterest",
  rp."refProductDuration",
  l."refLoanDueDate",
  rp."refLoanDueType",
  rp."refInterestCalType",
  rp."refRePaymentType"`;

export const generateReCalInterest1 = `WITH
  loan_data AS (
    SELECT
      $1::NUMERIC AS loan_amount,
      $2::INTEGER AS product_duration,
      $3::NUMERIC AS product_interest,
      TO_TIMESTAMP($4, 'DD/MM/YYYY, HH12:MI:SS AM') AS loan_start_date,
      $5::INTEGER AS repayment_type,
      $6::INTEGER AS refLoanDueType,
      $7::INTEGER AS refInterestCalType,
      (
        (
          $1::NUMERIC * ($3::NUMERIC * $2::INTEGER)
        ) / 100
      ) AS total_interest,
      CASE
        WHEN $6 = 1 THEN CASE
          WHEN $7 = 1 THEN (
            SELECT SUM(EXTRACT(DAY FROM (
              date_trunc('MONTH', TO_TIMESTAMP($4, 'DD/MM/YYYY, HH12:MI:SS AM') + (INTERVAL '1 month' * s.i))
              + INTERVAL '1 month - 1 day'
            ))) FROM generate_series(0, $2 - 1) AS s(i)
          )
          ELSE $2
        END
        WHEN $6 = 2 THEN CASE
          WHEN $7 = 1 THEN $2 * 7
          ELSE $2
        END
        WHEN $6 = 3 THEN $2
      END AS total_duration
  ),
  repayment_schedule AS (
    SELECT
      TO_CHAR(
        CASE
          WHEN ld.refLoanDueType = 1 THEN ld.loan_start_date + (m.num - 1) * INTERVAL '1 month'
          WHEN ld.refLoanDueType = 2 THEN ld.loan_start_date + (m.num - 1) * INTERVAL '1 week'
          WHEN ld.refLoanDueType = 3 THEN ld.loan_start_date + (m.num - 1) * INTERVAL '1 day'
        END,
        'DD-MM-YYYY'
      ) AS payment_date,

      ROUND(
        CASE
          WHEN ld.repayment_type = 3 THEN 0
          ELSE ld.loan_amount / ld.product_duration
        END,
        2
      ) AS refPrincipal,

      ROUND(
        CASE
          WHEN ld.repayment_type IN (1, 3) THEN CASE
            WHEN ld.refInterestCalType = 1 THEN (
              (ld.total_interest / ld.total_duration) * EXTRACT(
                DAY FROM (
                  date_trunc('MONTH', ld.loan_start_date + (m.num - 1) * INTERVAL '1 month')
                  + INTERVAL '1 month - 1 day'
                )
              )
            )
            ELSE ld.total_interest / ld.total_duration
          END
          WHEN ld.repayment_type = 2 THEN (
            (
              ld.loan_amount - ((ld.loan_amount / ld.product_duration) * (m.num - 1))
            ) * (ld.product_interest * ld.product_duration)
          ) / (
            CASE
              WHEN ld.refLoanDueType = 1 THEN CASE
                WHEN ld.refInterestCalType = 1 THEN (
                  SELECT SUM(EXTRACT(DAY FROM (
                    date_trunc('MONTH', ld.loan_start_date + (s.i * INTERVAL '1 month'))
                    + INTERVAL '1 month - 1 day'
                  )))
                  FROM generate_series(0, ld.product_duration - 1) AS s(i)
                )
                ELSE ld.product_duration
              END
              WHEN ld.refLoanDueType = 2 THEN CASE
                WHEN ld.refInterestCalType = 1 THEN (ld.product_duration * 7)
                ELSE ld.product_duration
              END
              WHEN ld.refLoanDueType = 3 THEN ld.product_duration
            END
          )
        END,
        2
      ) AS refInterest

    FROM
      loan_data ld
      CROSS JOIN generate_series(1, ld.product_duration) AS m(num)
  )
SELECT
  *
FROM
  repayment_schedule;`;

export const generateReCalInterest = `WITH
  loan_data AS (
    SELECT
      $1::NUMERIC AS loan_amount,
      $2::INTEGER AS product_duration,
      $3::NUMERIC AS product_interest,
      TO_TIMESTAMP($4, 'DD/MM/YYYY, HH12:MI:SS AM') AS loan_start_date,
      $5::INTEGER AS repayment_type,
      $6::INTEGER AS refLoanDueType,
      $7::INTEGER AS refInterestCalType,
      (($1::NUMERIC * ($3::NUMERIC * $2::INTEGER)) / 100) AS total_interest,
      CASE
        WHEN $6 = 1 THEN CASE
          WHEN $7 = 1 THEN (
            SELECT
              SUM(
                EXTRACT(
                  DAY FROM (
                    date_trunc(
                      'MONTH',
                      TO_TIMESTAMP($4, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') + (INTERVAL '1 month' * s.i)
                    ) + INTERVAL '1 month - 1 day'
                  )
                )
              )
            FROM generate_series(0, $2 - 1) AS s(i)
          )
          ELSE $2
        END
        WHEN $6 = 2 THEN CASE
          WHEN $7 = 1 THEN $2 * 7
          ELSE $2
        END
        WHEN $6 = 3 THEN $2
      END AS total_duration
  ),
  repayment_schedule AS (
    SELECT
      TO_CHAR(
        CASE
          WHEN ld.refLoanDueType = 1 THEN ld.loan_start_date + (m.num - 1) * INTERVAL '1 month'
          WHEN ld.refLoanDueType = 2 THEN ld.loan_start_date + (m.num - 1) * INTERVAL '1 week'
          WHEN ld.refLoanDueType = 3 THEN ld.loan_start_date + (m.num - 1) * INTERVAL '1 day'
        END,
        'DD-MM-YYYY'
      ) AS payment_date,
      ROUND(
        CASE
          WHEN ld.repayment_type = 3 THEN 0
          WHEN m.num = ld.product_duration THEN ld.loan_amount - (
            ROUND(ld.loan_amount / ld.product_duration) * (ld.product_duration - 1)
          )
          ELSE ROUND(ld.loan_amount / ld.product_duration)
        END
      ) AS refPrincipal,
      ROUND(
        CASE
          WHEN ld.repayment_type IN (1, 3) THEN
            CASE
              WHEN ld.refInterestCalType = 1 THEN (
                (ld.total_interest / ld.total_duration) * 
                CASE
                  WHEN ld.refLoanDueType = 1 THEN EXTRACT(
                    DAY FROM (
                      DATE_TRUNC(
                        'MONTH',
                        ld.loan_start_date + (m.num - 1) * INTERVAL '1 month'
                      ) + INTERVAL '1 month - 1 day'
                    )
                  )
                  WHEN ld.refLoanDueType = 2 THEN 7
                  WHEN ld.refLoanDueType = 3 THEN 1
                END
              )
              ELSE ld.total_interest / ld.total_duration
            END
          WHEN ld.repayment_type = 2 THEN
            CASE
              WHEN ld.refInterestCalType = 1 THEN (
                (
                  (
                    ld.loan_amount - (ld.loan_amount / ld.product_duration) * (m.num - 1)
                  ) * (ld.product_interest * ld.product_duration)
                ) / 100
              ) / CASE
                WHEN ld.refLoanDueType = 1 THEN (
                  SELECT SUM(
                    EXTRACT(
                      DAY FROM (
                        DATE_TRUNC(
                          'MONTH',
                          ld.loan_start_date + (INTERVAL '1 month' * s.i)
                        ) + INTERVAL '1 month - 1 day'
                      )
                    )
                  )
                  FROM generate_series(0, ld.product_duration - 1) AS s(i)
                )
                WHEN ld.refLoanDueType = 2 THEN 7 * ld.product_duration
                WHEN ld.refLoanDueType = 3 THEN ld.product_duration
              END * 
              CASE
                WHEN ld.refLoanDueType = 1 THEN EXTRACT(
                  DAY FROM (
                    DATE_TRUNC(
                      'MONTH',
                      ld.loan_start_date + (m.num - 1) * INTERVAL '1 month'
                    ) + INTERVAL '1 month - 1 day'
                  )
                )
                WHEN ld.refLoanDueType = 2 THEN 7
                WHEN ld.refLoanDueType = 3 THEN 1
              END
              ELSE (
                (
                  ld.loan_amount - (ld.loan_amount / ld.product_duration) * (m.num - 1)
                ) * ld.product_interest
              ) / 100
            END
        END,
        0
      ) AS refInterest
    FROM
      loan_data ld
      CROSS JOIN generate_series(1, ld.product_duration) AS m(num)
  )
SELECT * FROM repayment_schedule;
`;

export const updateRePaymentSchedule = `UPDATE
  public."refRepaymentSchedule" AS rrs
SET
  "refPrincipal" = update_data.refprincipal::NUMERIC,
  "refInterest" = update_data.refinterest::NUMERIC,
  "refArears" = update_data.refprincipal::NUMERIC + update_data.refinterest::NUMERIC
FROM (
  SELECT
    x.payment_date,
    x.refprincipal,
    x.refinterest
  FROM
    jsonb_to_recordset($1::jsonb) AS x (
      payment_date TEXT,
      refprincipal TEXT,
      refinterest TEXT
    )
) AS update_data
WHERE
  rrs."refLoanId" = $2::NUMERIC
  AND TO_DATE(rrs."refPaymentDate", 'DD-MM-YYYY') = TO_DATE(update_data.payment_date, 'DD-MM-YYYY');
`;

export const addFund = `INSERT INTO
  public."refBankFund" (
    "refBankId",
    "refbfTransactionDate",
    "refbfTrasactionType",
    "refbfTransactionAmount",
    "refTxnId",
    "refFundType",
    "refPaymentType",
    "refFundTypeId",
    "createdAt",
    "createdBy"
  )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;

export const checkBalance = `SELECT
  COALESCE(
    SUM(
      rs."refPaidPrincipal"::NUMERIC
    ), 0
  ) AS "Total_Amount",
  COALESCE(rl."refLoanAmount"::numeric, 0) -
  COALESCE(
    SUM(
      rs."refPaidPrincipal"::NUMERIC
    ), 0
  ) AS "Balance_Amount"
FROM
  public."refRepaymentSchedule" rs
  LEFT JOIN public."refLoan" rl ON rl."refLoanId"::numeric = rs."refLoanId"::numeric
WHERE
  rs."refLoanId"::numeric = $1
GROUP BY
  rl."refLoanId", rl."refLoanAmount";`;

