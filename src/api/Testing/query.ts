export const addFund = `UPDATE
  public."refBankAccounts"
SET
  "refBalance" = CASE
    WHEN "refBankId" = $1 THEN (
      CAST(
        COALESCE(NULLIF("refBalance", ''), '0') AS NUMERIC
      ) - $3
    )::TEXT
    WHEN "refBankId" = $2 THEN (
      CAST(
        COALESCE(NULLIF("refBalance", ''), '0') AS NUMERIC
      ) + $3
    )::TEXT
    ELSE "refBalance"
  END,
  "updatedAt" = $4, -- Update refUpdatedAt with $4
  "updatedBy" = $5 -- Update refUpdatedBy with $5
WHERE
  "refBankId" IN ($1, $2);
`;

export const updateFund = `INSERT INTO public."refBankFund" (
    "refBankId",
    "refbfTransactionDate",
    "refbfTrasactionType",
    "refbfTransactionAmount",
    "refTxnId",
    "createdAt",
    "createdBy",
    "refFundType",
    "refFundTypeId"
  )
  VALUES
    (
      $1,
      TO_CHAR(TO_TIMESTAMP($4, 'DD/MM/YYYY, HH12:MI:SS AM'), 'YYYY-MM-DD'),
      'debit',
      $3::TEXT,
      NULL,
      $4,
      $5,
      'Self Transfer'
    ),
    (
      $2,
      TO_CHAR(TO_TIMESTAMP($4, 'DD/MM/YYYY, HH12:MI:SS AM'), 'YYYY-MM-DD'),
      'credit',
      $3::TEXT,
      NULL,
      $4,
      $5,
      'Self Transfer'
    );
  `;

export const testQuery = `SELECT
  l."refLoanId",
  l."refLoanAmount",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(CAST(rs."refPaidPrincipal" AS NUMERIC))
        FROM
          public."refRepaymentSchedule" rs
        WHERE
          CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
      ),
      0
    )
  ) AS "totalPrincipalPaid",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(CAST(rs."refPaidInterest" AS NUMERIC))
        FROM
          public."refRepaymentSchedule" rs
        WHERE
          CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
      ),
      0
    )
  ) AS "totalInterestPaid",
  l."refInitialInterest",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(CAST(rs."refInterest" AS NUMERIC))
        FROM
          public."refRepaymentSchedule" rs
        WHERE
          CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
          AND l."isInterestFirst" = true
          AND (
            SELECT
              COUNT(*)
            FROM
              public."refRepaymentSchedule" rs_inner
            WHERE
              rs_inner."refLoanId" = rs."refLoanId"
              AND TO_DATE(rs_inner."refPaymentDate", 'DD-MM-YYYY') <= TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY')
          ) <= l."refInterestMonthCount"
      ),
      0
    )
  ) AS "interestPaidFirstAmount",
  l."refInterestMonthCount",
  rp."refProductDuration",
  rp."refProductInterest",
  rp."refLoanDueType",
  rp."refInterestCalType",
  rp."refRePaymentType",
  l."refRepaymentStartDate",
  (
    SELECT
      "refSettingValue"
    FROM
      settings."refSettings" s
    WHERE
      s."refSettingId" = 4
  ) AS "refSettingValue"
FROM
  public."refLoan" l
  LEFT JOIN public."refLoanProducts" rp ON CAST(rp."refProductId" AS INTEGER) = l."refProductId"::INTEGER
  LEFT JOIN public."refRepaymentSchedule" rs ON CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"::INTEGER
WHERE
  l."refLoanId" = $1
GROUP BY
  l."refLoanId",
  l."isInterestFirst",
  l."refInterestMonthCount",
  rp."refProductInterest",
  rp."refProductDuration",
  rp."refInterestCalType",
  rp."refLoanDueType",
  l."refLoanAmount",
  l."createdAt",
  l."refInitialInterest",
  l."refRepaymentStartDate",
  rp."refRePaymentType"`;