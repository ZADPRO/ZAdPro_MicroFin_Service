export const userList = `SELECT
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

export const nameQuery = `SELECT "refUserFname" , "refUserLname" FROM public."users" WHERE "refUserId" = $1
`;

export const rePaymentCalculation = `SELECT
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
          CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId" AND rp2."refInterestStatus" = 'paid'
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
  LEFT JOIN public."refRepaymentType" rt ON CAST (rt."refRepaymentTypeId" AS INTEGER) = rl."refRePaymentType"::INTEGER
WHERE
  rl."refLoanId" = $1
  AND rp."refRpayId" = $2;`;
export const bankList = `SELECT
  b."refBankId",
  b."refBankName",
  b."refBankAccountNo",
  b."refIFSCsCode"
FROM
  public."refBankAccounts" b
WHERE
  b."refAccountType" = 1`;

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
    "refPaymentType"
  )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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

export const loanAudit = `SELECT
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
  rp."refPrincipal"
ORDER BY
  rp."refRpayId";`;

export const getLoanDetails = `SELECT
rl."refLoanId",
  rl."refLoanAmount",
  rl."refCustLoanId",
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
  INNER JOIN public."refProducts" rpr ON CAST(rpr."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
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
  rt."refRepaymentTypeName"`;
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
  INNER JOIN public."refProducts" rpr ON CAST(rpr."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
  INNER JOIN public."refLoanStatus" ls ON CAST (ls."refLoanStatusId" AS INTEGER) = rl."refLoanStatus"
  LEFT JOIN public."refRepaymentType" rt ON CAST (rt."refRepaymentTypeId" AS INTEGER) = rl."refRePaymentType"
WHERE
  rl."refLoanId"=$1
GROUP BY
  rl."refLoanId",
  rpr."refProductName",
  rpr."refProductInterest",
  rpr."refProductDuration",
  ls."refLoanStatus",
  rt."refRepaymentTypeName"`;

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

export const updateReInterestCal = `UPDATE public."refRepaymentSchedule" AS rrs
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
    AND rrs."refPaymentDate" = update_data.payment_month;
  `;
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

export const getReCalParams = `SELECT
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
