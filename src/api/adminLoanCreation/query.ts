export const vendorList = `SELECT
  vd."refVendorId",
  vd."refVendorName",
  vd."refVendorMobileNo",
  vd."refVenderType",
  vd."refDescription",
  vd."refAddress",
  vd."refVendorEmailId"
FROM
  adminloan."refVendorDetails" vd`;

export const getLoanList = `SELECT
  l."refLoanId",
  l."refLoanAmount",
  l."refLoanStartDate",
  l."refLoanDuration",
  l."refLoanInterest"
FROM
  adminloan."refLoan" l
WHERE
  l."refVenderId" = $1
  AND l."refLoanStatus" = 1`;

export const getLoanDataOption = `SELECT
  rl."refLoanId",
  rl."refLoanAmount",
  rl."refLoanDuration",
  rl."refLoanInterest"
  

FROM
  adminloan."refLoan" rl
WHERE
  rl."refVenderId" = $1 AND rl."refLoanStatus" = 1`;

export const getBankQuery = `SELECT * FROM public."refBankAccounts" rba
WHERE rba."refBankId" = $1;
`;

export const addNewLoan1 = `WITH
  inserted_refLoan AS (
    INSERT INTO
      adminloan."refLoan" (
        "refVenderId",
        "refLoanDuration",
        "refLoanInterest",
        "refLoanAmount",
        "refLoanDueDate",
        "refPayementType",
        "refRepaymentStartDate",
        "refLoanStartDate",
        "refBankId",
        "refLoanBalance",
        "isInterestFirst",
        "createdAt",
        "createdBy",
        "refExLoanId",
        "refLoanExt",
        "refLoanStatus",
        "refInterestMonthCount",
        "refInitialInterest",
        "refRePaymentType"
      )
    VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17,
        $18,
        $19
      )
    RETURNING
      "refLoanId",
      "refLoanAmount",
      "refLoanDuration",
      "refLoanInterest"
  ),
  repayment_input AS (
    SELECT
      ir."refLoanId" AS loan_id,
      ir."refLoanAmount"::NUMERIC AS loan_amount,
      ir."refLoanDuration"::NUMERIC AS product_duration,
      ir."refLoanInterest"::NUMERIC AS product_interest,
      TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS repayment_start_date
    FROM
      inserted_refLoan ir
  ),
  repayment_schedule AS (
    SELECT
      r.loan_id,
      TO_CHAR(
        DATE_TRUNC('MONTH', r.repayment_start_date) + (gs.month_num - 1) * INTERVAL '1 month',
        'YYYY-MM'
      ) AS refPaymentDate,
      r.loan_amount::numeric AS refPaymentAmount,
      ROUND(
        r.loan_amount::numeric / r.product_duration::numeric,
        2
      ) AS refPrincipal,
      ROUND(
        CASE
          WHEN $18 = 1 THEN (
            (
              (
                (
                  r.loan_amount::numeric * (r.product_interest::numeric * 12)
                ) / 100
              ) / 365
            ) * EXTRACT(
              DAY
              FROM
                (
                  DATE_TRUNC(
                    'MONTH',
                    TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') + INTERVAL '1 month' * gs.month_num
                  ) - INTERVAL '1 day'
                )
            )
          )
          WHEN $18 = 2 THEN (
            (
              (
                (
                  r.loan_amount - (
                    (
                      r.loan_amount::numeric / r.product_duration::numeric
                    ) * (gs.month_num - 1)
                  )
                ) * (r.product_interest::numeric * 12)
              ) / 100
            ) / 365 * EXTRACT(
              DAY
              FROM
                (
                  DATE_TRUNC(
                    'MONTH',
                    TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') + INTERVAL '1 month' * gs.month_num
                  ) - INTERVAL '1 day'
                )
            )
          )
        END,
        2
      ) AS refInterest,
      'Pending' AS refPrincipalStatus,
      gs.month_num AS refRepaymentNumber,
      ROUND(
        (
          (
            r.loan_amount::numeric / r.product_duration::numeric
          ) + CASE
            WHEN $18 = 1 THEN (
              (
                (
                  r.loan_amount::numeric * (r.product_interest::numeric * 12)
                ) / 100
              ) / 365
            ) * EXTRACT(
              DAY
              FROM
                DATE_TRUNC(
                  'MONTH',
                  r.repayment_start_date + (gs.month_num - 1) * INTERVAL '1 month'
                )
            )
            WHEN $18 = 2 THEN (
              (
                (
                  (
                    r.loan_amount::numeric - (
                      (
                        r.loan_amount::numeric / r.product_duration::numeric
                      ) * (gs.month_num - 1)
                    )
                  ) * (r.product_interest::numeric * 12)
                ) / 100
              ) / 365
            ) * EXTRACT(
              DAY
              FROM
                DATE_TRUNC(
                  'MONTH',
                  r.repayment_start_date + (gs.month_num - 1) * INTERVAL '1 month'
                )
            )
          END
        ),
        2
      ) AS refRepaymentAmount,
      $11 AS createdAt,
      $12 AS createdBy,
      CASE
        WHEN gs.month_num <= $16 THEN 'paid'
        ELSE 'Pending'
      END AS refInterestStatus
    FROM
      repayment_input r
      JOIN generate_series(1, r.product_duration::numeric) AS gs (month_num) ON TRUE
  )
INSERT INTO
  adminloan."refRepaymentSchedule" (
    "refLoanId",
    "refPaymentDate",
    "refPaymentAmount",
    "refPrincipal",
    "refInterest",
    "refPrincipalStatus",
    "refRepaymentNumber",
    "refRepaymentAmount",
    "createdAt",
    "createdBy",
    "refInterestStatus"
  )
SELECT
  loan_id,
  refPaymentDate,
  refPaymentAmount,
  refPrincipal,
  refInterest,
  refPrincipalStatus,
  refRepaymentNumber,
  refRepaymentAmount,
  createdAt,
  createdBy,
  refInterestStatus
FROM
  repayment_schedule
RETURNING
  "refLoanId"`;
export const addNewLoan2 = `WITH
  inserted_refLoan AS (
    INSERT INTO
      adminloan."refLoan" (
        "refVenderId",
        "refLoanDuration",
        "refLoanInterest",
        "refLoanAmount",
        "refLoanDueDate",
        "refPayementType",
        "refRepaymentStartDate",
        "refLoanStartDate",
        "refBankId",
        "refLoanBalance",
        "isInterestFirst",
        "createdAt",
        "createdBy",
        "refExLoanId",
        "refLoanExt",
        "refLoanStatus",
        "refInterestMonthCount",
        "refInitialInterest",
        "refRePaymentType",
        "refDocFee",
        "refSecurity"
      )
    VALUES
      (
        $1,
        $2::INTEGER,
        $3::Numeric,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17,
        $18,
        $19,
        $20,
        $21
      )
    RETURNING
      "refLoanId",
      "refLoanAmount",
      "refLoanDuration",
      "refLoanInterest"
  ),
  repayment_input AS (
    SELECT
      ir."refLoanId" AS loan_id,
      ir."refLoanAmount"::NUMERIC AS loan_amount,
      ir."refLoanDuration"::INTEGER AS product_duration,
      ir."refLoanInterest"::NUMERIC AS product_interest,
      TO_TIMESTAMP($7, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS repayment_start_date
    FROM
      inserted_refLoan ir
  ),
  repayment_schedule AS (
    SELECT
      r.loan_id,
      TO_CHAR(
        DATE_TRUNC('MONTH', r.repayment_start_date) + (gs.month_num - 1) * INTERVAL '1 month',
        'YYYY-MM'
      ) AS refPaymentDate,
      r.loan_amount::numeric AS refPaymentAmount,
      ROUND(
        CASE
          WHEN $19 = 3 THEN 0
          ELSE r.loan_amount::numeric / r.product_duration::numeric
        END,
        2
      ) AS refPrincipal,
      ROUND(
        CASE
          WHEN $19 IN (1, 3) THEN (
            (
              (
                (
                  r.loan_amount::numeric * (r.product_interest::numeric * 12)
                ) / 100
              ) / 365
            ) * EXTRACT(
              DAY
              FROM
                (
                  DATE_TRUNC(
                    'MONTH',
                    TO_TIMESTAMP($7, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') + INTERVAL '1 month' * gs.month_num
                  ) - INTERVAL '1 day'
                )
            )
          )
          WHEN $19 = 2 THEN (
            (
              (
                (
                  r.loan_amount - (
                    (
                      r.loan_amount::numeric / r.product_duration::numeric
                    ) * (gs.month_num - 1)
                  )
                ) * (r.product_interest::numeric * 12)
              ) / 100
            ) / 365 * EXTRACT(
              DAY
              FROM
                (
                  DATE_TRUNC(
                    'MONTH',
                    TO_TIMESTAMP($7, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') + INTERVAL '1 month' * gs.month_num
                  ) - INTERVAL '1 day'
                )
            )
          )
        END,
        2
      ) AS refInterest,
      'Pending' AS refPrincipalStatus,
      gs.month_num AS refRepaymentNumber,
      ROUND(
        CASE
          WHEN $19 IN (1, 2) THEN (
            (
              r.loan_amount::numeric / r.product_duration::numeric
            ) + CASE
              WHEN $19 = 1 THEN (
                (
                  (
                    r.loan_amount::numeric * (r.product_interest::numeric * 12)
                  ) / 100
                ) / 365
              ) * EXTRACT(
                DAY
                FROM
                  DATE_TRUNC(
                    'MONTH',
                    r.repayment_start_date + (gs.month_num - 1) * INTERVAL '1 month'
                  )
              )
              WHEN $19 = 2 THEN (
                (
                  (
                    (
                      r.loan_amount::numeric - (
                        (
                          r.loan_amount::numeric / r.product_duration::numeric
                        ) * (gs.month_num - 1)
                      )
                    ) * (r.product_interest::numeric * 12)
                  ) / 100
                ) / 365
              ) * EXTRACT(
                DAY
                FROM
                  DATE_TRUNC(
                    'MONTH',
                    r.repayment_start_date + (gs.month_num - 1) * INTERVAL '1 month'
                  )
              )
            END
          )
          ELSE (
            (
              (
                r.loan_amount::numeric * (r.product_interest::numeric * 12)
              ) / 100
            ) / 365
          ) * EXTRACT(
            DAY
            FROM
              DATE_TRUNC(
                'MONTH',
                r.repayment_start_date + (gs.month_num - 1) * INTERVAL '1 month'
              )
          )
        END,
          2
        ) AS refRepaymentAmount,
        $11 AS createdAt,
        $12 AS createdBy,
        CASE
          WHEN gs.month_num <= $16 THEN 'paid'
          ELSE 'Pending'
        END AS refInterestStatus
        FROM
          repayment_input r
          JOIN generate_series(1, r.product_duration::numeric) AS gs (month_num) ON TRUE
      )
    INSERT INTO
      adminloan."refRepaymentSchedule" (
        "refLoanId",
        "refPaymentDate",
        "refPaymentAmount",
        "refPrincipal",
        "refInterest",
        "refPrincipalStatus",
        "refRepaymentNumber",
        "refRepaymentAmount",
        "createdAt",
        "createdBy",
        "refInterestStatus"
      )
    SELECT
      loan_id,
      refPaymentDate,
      refPaymentAmount,
      refPrincipal,
      refInterest,
      refPrincipalStatus,
      refRepaymentNumber,
      refRepaymentAmount,
      createdAt,
      createdBy,
      refInterestStatus
    FROM
      repayment_schedule
    RETURNING
      "refLoanId"`;

export const addNewLoan = `WITH
  inserted_refLoan AS (
    INSERT INTO
      adminloan."refLoan" (
        "refVenderId",
        "refLoanDuration",
        "refLoanInterest",
        "refLoanAmount",
        "refLoanDueDate",
        "refPayementType",
        "refRepaymentStartDate",
        "refLoanStartDate",
        "refBankId",
        "refLoanBalance",
        "isInterestFirst",
        "createdAt",
        "createdBy",
        "refExLoanId",
        "refLoanExt",
        "refLoanStatus",
        "refInterestMonthCount",
        "refInitialInterest",
        "refRePaymentType",
        "refDocFee",
        "refSecurity",
        "refProductDurationType",
        "refProductMonthlyCal"
      )
    VALUES
      (
        $1,
        $2::INTEGER,
        $3::Numeric,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17,
        $18,
        $19,
        $20,
        $21,
        $22,
        $23
      )
    RETURNING
      "refLoanId",
      "refCustLoanId",
      "refLoanAmount",
      "refLoanDuration",
      "refLoanInterest",
      "refProductDurationType",
      "refProductMonthlyCal"
  ),
  repayment_input AS (
    SELECT
      ir."refLoanId" AS loan_id,
      ir."refLoanAmount"::NUMERIC AS loan_amount,
      ir."refLoanDuration"::INTEGER AS product_duration,
      ir."refLoanInterest"::NUMERIC AS product_interest,
      ir."refProductDurationType"::INTEGER AS duration_type,
      ir."refProductMonthlyCal"::INTEGER AS monthly_cal,
      TO_TIMESTAMP($7, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS repayment_start_date
    FROM
      inserted_refLoan ir
  ),
  repayment_schedule AS (
    SELECT
      r.loan_id,
      TO_CHAR(
        CASE
          WHEN r.duration_type::NUMERIC = 1::NUMERIC THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
          WHEN r.duration_type::NUMERIC = 2::NUMERIC THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 week'
          WHEN r.duration_type::NUMERIC = 3::NUMERIC THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 day'
        END,
        'DD-MM-YYYY'
      ) AS refPaymentDate,
      r.loan_amount::Numeric AS refPaymentAmount,
      ROUND(
        CASE
          WHEN $19::Numeric = 3 THEN 0
          ELSE r.loan_amount::Numeric / r.product_duration::Numeric
        END,
        2
      ) AS refPrincipal,
      ROUND(
        CASE
          WHEN $19 IN (1, 3) THEN (
            (r.loan_amount * (r.product_interest * 12) / 100) / CASE
              WHEN r.duration_type = 1
              AND r.monthly_cal = 1 THEN 365
              WHEN r.duration_type = 1
              AND r.monthly_cal = 2 THEN 12
              WHEN r.duration_type IN (2, 3) THEN 365
              ELSE 1
            END
          ) * CASE
            WHEN r.duration_type = 1
            AND r.monthly_cal = 1 THEN EXTRACT(
              DAY
              FROM
                DATE_TRUNC(
                  'MONTH',
                  r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                ) + INTERVAL '1 month' - INTERVAL '1 day'
            )
            WHEN r.duration_type = 1
            AND r.monthly_cal = 2 THEN 1
            WHEN r.duration_type = 2 THEN 7
            WHEN r.duration_type = 3 THEN 1
            ELSE 1
          END
          WHEN $19 = 2 THEN (
            (
              r.loan_amount - (
                (r.loan_amount / r.product_duration) * (gs.period_num - 1)
              )
            ) * (r.product_interest * 12) / 100 / CASE
              WHEN r.duration_type = 1
              AND r.monthly_cal = 1 THEN 365
              WHEN r.duration_type = 1
              AND r.monthly_cal = 2 THEN 12
              WHEN r.duration_type IN (2, 3) THEN 365
              ELSE 1
            END
          ) * CASE
            WHEN r.duration_type = 1
            AND r.monthly_cal = 1 THEN EXTRACT(
              DAY
              FROM
                DATE_TRUNC(
                  'MONTH',
                  r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                ) + INTERVAL '1 month' - INTERVAL '1 day'
            )
            WHEN r.duration_type = 1
            AND r.monthly_cal = 2 THEN 1
            WHEN r.duration_type = 2 THEN 7
            WHEN r.duration_type = 3 THEN 1
            ELSE 1
          END
          ELSE 0
        END,
        2
      ) AS refInterest,
      'Pending' AS refPrincipalStatus,
      gs.period_num AS refRepaymentNumber,
      ROUND(
        CASE
          WHEN $19 IN (1, 2) THEN (
            (
              r.loan_amount::Numeric / r.product_duration::Numeric
            ) + CASE
              WHEN $19 = 1 THEN (
                (
                  r.loan_amount::Numeric * (r.product_interest::Numeric * 12) / 100
                ) / CASE
                  WHEN r.duration_type::Numeric = 1
                  AND r.monthly_cal::Numeric = 1 THEN 365
                  WHEN r.duration_type::Numeric = 1
                  AND r.monthly_cal::Numeric = 2 THEN 12
                  WHEN r.duration_type::Numeric = 2 THEN 365
                  WHEN r.duration_type::Numeric = 3 THEN 365
                END
              ) * CASE
                WHEN r.duration_type::Numeric = 1 THEN EXTRACT(
                  DAY
                  FROM
                    DATE_TRUNC(
                      'MONTH',
                      r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                    ) + INTERVAL '1 month' - INTERVAL '1 day'
                )
                WHEN r.duration_type::Numeric = 2 THEN 7
                WHEN r.duration_type::Numeric = 3 THEN 1
              END
              WHEN $19::Numeric = 2 THEN (
                (
                  (
                    r.loan_amount::Numeric - (
                      (
                        r.loan_amount::Numeric / r.product_duration::Numeric
                      ) * (gs.period_num - 1)
                    )
                  ) * (r.product_interest::Numeric * 12) / 100
                ) / CASE
                  WHEN r.duration_type::Numeric = 1
                  AND r.monthly_cal::Numeric = 1 THEN 365
                  WHEN r.duration_type::Numeric = 1
                  AND r.monthly_cal::Numeric = 2 THEN 12
                  WHEN r.duration_type::Numeric = 2 THEN 365
                  WHEN r.duration_type::Numeric = 3 THEN 365
                END
              ) * CASE
                WHEN r.duration_type::Numeric = 1 THEN EXTRACT(
                  DAY
                  FROM
                    DATE_TRUNC(
                      'MONTH',
                      r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                    ) + INTERVAL '1 month' - INTERVAL '1 day'
                )
                WHEN r.duration_type::Numeric = 2 THEN 7
                WHEN r.duration_type::Numeric = 3 THEN 1
              END
            END
          )
          ELSE (
            (
              r.loan_amount::Numeric / r.product_duration::Numeric
            ) + (
              (
                r.loan_amount::Numeric * (r.product_interest::Numeric * 12) / 100
              ) / CASE
                WHEN r.duration_type::Numeric = 1
                AND r.monthly_cal::Numeric = 1 THEN 365
                WHEN r.duration_type::Numeric = 1
                AND r.monthly_cal::Numeric = 2 THEN 12
                WHEN r.duration_type::Numeric = 2 THEN 365
                WHEN r.duration_type::Numeric = 3 THEN 365
              END
            ) * CASE
              WHEN r.duration_type::Numeric = 1 THEN EXTRACT(
                DAY
                FROM
                  DATE_TRUNC(
                    'MONTH',
                    r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                  ) + INTERVAL '1 month' - INTERVAL '1 day'
              )
              WHEN r.duration_type::Numeric = 2 THEN 7
              WHEN r.duration_type::Numeric = 3 THEN 1
            END
          )
        END,
        2
      ) AS refRepaymentAmount,
      $11 AS createdAt,
      $12 AS createdBy,
      CASE
        WHEN gs.period_num <= $17 THEN 'paid'
        ELSE 'Pending'
      END AS refInterestStatus
    FROM
      repayment_input r
      JOIN generate_series(1, r.product_duration::Numeric) AS gs (period_num) ON TRUE
  )
INSERT INTO
  adminloan."refRepaymentSchedule" (
    "refLoanId",
    "refPaymentDate",
    "refPaymentAmount",
    "refPrincipal",
    "refInterest",
    "refPrincipalStatus",
    "refRepaymentNumber",
    "refRepaymentAmount",
    "createdAt",
    "createdBy",
    "refInterestStatus"
  )
SELECT
  loan_id,
  refPaymentDate,
  refPaymentAmount,
  refPrincipal,
  refInterest,
  refPrincipalStatus,
  refRepaymentNumber,
  refRepaymentAmount,
  createdAt,
  createdBy,
  refInterestStatus
FROM
  repayment_schedule
RETURNING
  "refLoanId",
  (SELECT "refCustLoanId" FROM inserted_refLoan LIMIT 1) AS "refCustLoanId";`;

export const updateBankFundQuery = `INSERT INTO 
   public."refBankFund" (
     "refBankId",
     "refbfTransactionDate",
     "refbfTrasactionType",  
     "refbfTransactionAmount",
     "refTxnId",
     "refFundType", 
     "refFundTypeId",
     "createdAt",
     "createdBy"
      )
 VALUES
   ($1, $2, $3, $4, $5, $6, $7, $8,$9)
   RETURNING *;`;

export const updateLoan = `UPDATE
  adminloan."refLoan"
SET
  ("refLoanStatus", "updatedAt", "updatedBy") = ($2, $3, $4)
WHERE
  "refLoanId" = $1
RETURNING
  *;`;

export const updateBankAccountDebitQuery = `
UPDATE public."refBankAccounts" 
SET 
  "refBalance" = ("refBalance"::numeric + $1),
  "updatedAt" = $3, 
  "updatedBy" = $4
WHERE "refBankId" = $2
RETURNING "refBalance";
`;

export const getLoanDataQuery = `SELECT
  rl."refLoanDuration",
  rl."refLoanInterest",
  rl."refCustLoanId",
  rl."refLoanAmount" AS "principal",
  ls."refLoanStatus",
  rl."refInterest" AS "interestAmount",
  rl."refPayableAmount",
  rl."refLoanStartDate",
  rl."refLoanDueDate",
  rl."isInterestFirst",
  rl."refLoanId"
FROM
  adminloan."refLoan" rl
  LEFT JOIN public."refLoanStatus" ls ON CAST(ls."refLoanStatusId" AS INTEGER) = rl."refLoanStatus"
WHERE
  rl."refVenderId" = $1
  AND rl."refLoanStatus" = 1;`;

export const getAllBankAccountQuery = `SELECT
  rb."refBankId",
  rb."refBankName",
  rb."refBankAccountNo",
  rb."refIFSCsCode",
  rb."refBankAddress",
  rb."refBalance",
  rb."createdAt",
  rb."createdBy",
  rb."updatedAt",
  rb."updatedBy",
  rb."refAccountType",
  rbt."refAccountTypeName"
FROM
  public."refBankAccounts" rb
  LEFT JOIN public."refBankAccountType" rbt ON CAST (rbt."refAccountId" AS INTEGER) = rb."refAccountType"::INTEGER
ORDER BY
  "refBankId" DESC;
`;

export const loanList = `SELECT
  l."refLoanId",
  vd."refVendorId",
  vd."refVendorName",
  vd."refVendorMobileNo",
  vd."refVendorEmailId",
  vd."refVenderType",
  vd."refDescription",
  l."refLoanDuration",
  l."refLoanInterest",
  l."refLoanAmount",
  l."refLoanStartDate",
  ls."refLoanStatusId",
  ls."refLoanStatus",
  l."refProductDurationType",
  l."refProductMonthlyCal"

FROM
  adminloan."refLoan" l
  LEFT JOIN adminloan."refVendorDetails" vd ON CAST(vd."refVendorId" AS INTEGER) = l."refVenderId"::INTEGER
  LEFT JOIN public."refLoanStatus" ls ON CAST(ls."refLoanStatusId" AS INTEGER) = l."refLoanStatus"
  LEFT JOIN public."refBankAccounts" b ON CAST(b."refBankId" AS INTEGER) = l."refBankId"::INTEGER
WHERE
  b."refAccountType" = ANY ($1)`;

export const loanAudit = `SELECT
  rl."refLoanId",
  vd."refVendorName",
  rl."refLoanAmount",
  rl."refLoanInterest" AS "refProductInterest",
  rl."refLoanDuration" AS "refProductDuration",
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
          SUM(
            CAST(NULLIF(rp2."refInterest", 'null') AS NUMERIC)
          )
        FROM
        adminloan."refRepaymentSchedule" rp2
        WHERE
          CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId"
          AND rp2."refInterestStatus" = 'paid'
      ),
      0
    )::NUMERIC
  ) AS "totalInterest"
FROM
  adminloan."refLoan" rl
  INNER JOIN adminloan."refRepaymentSchedule" rp ON CAST(rp."refLoanId" AS INTEGER) = rl."refLoanId"::INTEGER
  INNER JOIN adminloan."refVendorDetails" vd ON CAST(vd."refVendorId" AS INTEGER) = rl."refVenderId"::INTEGER
  INNER JOIN public."refLoanStatus" ls ON CAST(ls."refLoanStatusId" AS INTEGER) = rl."refLoanStatus"
  LEFT JOIN public."refRepaymentType" rt ON CAST(rt."refRepaymentTypeId" AS INTEGER) = rl."refRePaymentType"
WHERE
  rl."refVenderId" = $1
  AND rl."refLoanId" = $2
GROUP BY
  rl."refLoanId",
  ls."refLoanStatus",
  rt."refRepaymentTypeName",
  vd."refVendorName"`;

export const loanRepaymaneAudit = `SELECT
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
  adminloan."refRepaymentSchedule" rp
  LEFT JOIN adminloan.refuserstatus us ON CAST(us."refRpayId" AS INTEGER) = rp."refRpayId"
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

export const closingData = `SELECT
  rl."refLoanId",
  vd."refVendorName",
  rl."refLoanAmount",
  rl."refLoanInterest" AS "refProductInterest",
  rl."refLoanDuration" AS "refProductDuration",
  rl."isInterestFirst",
  rl."refLoanStartDate",
  rl."refRepaymentStartDate",
  rl."refLoanDueDate",
  ls."refLoanStatus",
  rl."refInterestMonthCount",
  rl."refInitialInterest",
  rt."refRepaymentTypeName",
  rl."refProductDurationType",
  rl."refProductMonthlyCal",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(
            CAST(NULLIF(rp2."refPrincipal", 'null') AS NUMERIC)
          )
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
          SUM(
            CAST(NULLIF(rp2."refInterest", 'null') AS NUMERIC)
          )
        FROM
        adminloan."refRepaymentSchedule" rp2
        WHERE
          CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId"
          AND rp2."refInterestStatus" = 'paid'
      ),
      0
    )::NUMERIC
  ) AS "totalInterest"
FROM
  adminloan."refLoan" rl
  INNER JOIN adminloan."refVendorDetails" vd ON CAST(vd."refVendorId" AS INTEGER) = vd."refVendorId"::INTEGER
  INNER JOIN adminloan."refRepaymentSchedule" rp ON CAST(rp."refLoanId" AS INTEGER) = rl."refLoanId"::INTEGER
  INNER JOIN public."refLoanStatus" ls ON CAST(ls."refLoanStatusId" AS INTEGER) = rl."refLoanStatus"
  LEFT JOIN public."refRepaymentType" rt ON CAST(rt."refRepaymentTypeId" AS INTEGER) = rl."refRePaymentType"
WHERE
  rl."refLoanId" = $1
GROUP BY
  rl."refLoanId",
  ls."refLoanStatus",
  rt."refRepaymentTypeName",
  vd."refVendorName"`;

export const checkLoanPaid = `SELECT
  COALESCE(COUNT(*), 0) AS unpaid_count
FROM
  adminloan."refLoan" l
  LEFT JOIN adminloan."refRepaymentSchedule" rs 
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

export const updateCloseLoan = `UPDATE
  adminloan."refLoan"
SET
  ("refLoanStatus", "updatedAt", "updatedBy") = ($2, $3, $4)
WHERE
  "refLoanId" = $1
RETURNING
  *;`;

export const insertRepaymentSchedule = `INSERT INTO
  adminloan."refRepaymentSchedule"(
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

export const updateRepayment = `UPDATE public."refRepaymentSchedule"
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

export const getReCalParams = `SELECT
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
        adminloan."refRepaymentSchedule" rs
        WHERE
          CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
          AND rs."refPrincipalStatus" = 'paid'
      ),
      0
    )::NUMERIC
  ) AS "BalanceAmt",
  l."refLoanInterest" AS "refProductInterest",
  l."refProductDurationType",
  l."refProductMonthlyCal",
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
  repayment_schedule;`;

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
  adminloan."refRepaymentSchedule" AS rrs
SET
  "refPrincipal" = update_data."refprincipal",
  "refInterest" = update_data."refinterest"
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
  AND TO_DATE(rrs."refPaymentDate", 'DD-MM-YYYY') = TO_DATE(update_data."payment_date", 'DD-MM-YYYY');
`;
