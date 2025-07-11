export const getLoanList = `SELECT
  l."refLoanId",
  rp."refProductName",
  rp."refProductInterest",
  rp."refProductDuration",
  l."refLoanAmount",
  l."refLoanStartDate"
FROM
  public."refLoan" l
  LEFT JOIN public."refProducts" rp ON CAST(rp."refProductId" AS INTEGER) = l."refProductId"::INTEGER
WHERE
  l."refUserId" = $1
  AND l."refLoanStatus" = 1`;

export const getSelectedLoanDetails = `WITH
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
          COALESCE(l."refLoanAmount"::INTEGER, 0)::NUMERIC * (
            COALESCE(rp."refProductInterest"::INTEGER, 0)::NUMERIC / 100
          ) * COALESCE(l."refInterestMonthCount"::INTEGER, 0)
        ),
        2
      ) AS "InterestFirst"
    FROM
      public."refLoan" l
      LEFT JOIN public."refRepaymentSchedule" rs ON CAST(l."refLoanId" AS INTEGER) = rs."refLoanId"::INTEGER
      LEFT JOIN public."refProducts" rp ON CAST(rp."refProductId" AS INTEGER) = l."refProductId"::INTEGER
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
    ), 0
  ) AS "month_difference",
  
  GREATEST(
    EXTRACT(
      DAY
      FROM
        (TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'))
    ), 0
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
    ), 0
  ) AS "dayCountInMonth"
FROM
  "getData" ga;`;

export const addNewLoan1 = `WITH inserted_refLoan AS (
  INSERT INTO public."refLoan" (
    "refUserId",
    "refProductId",
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
    "refInitialInterest"
  )
  VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
  )
  RETURNING "refLoanId", "refProductId", "refLoanAmount"
),

product_details AS (
  SELECT "refProductId", "refProductDuration", "refProductInterest"
  FROM public."refProducts"
  WHERE "refProductId" = (SELECT "refProductId"::INTEGER FROM inserted_refLoan)
)

INSERT INTO public."refRepaymentSchedule" (
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
  "refBankFId",
  "refInterestStatus"
)
SELECT 
  ir."refLoanId",

  TO_CHAR(
    DATE_TRUNC('MONTH', TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) + INTERVAL '1 month' * (gs.month_num - 1),
    'YYYY-MM'
  ) AS "refPaymentDate",

  $3 AS "refPaymentAmount",

  ($3::NUMERIC / pd."refProductDuration"::INTEGER) AS "refPrincipal",

  (
    (
      ($3::NUMERIC * (pd."refProductInterest"::INTEGER * 12) / 100) / 365
    ) * 
    EXTRACT(
      DAY FROM (
        DATE_TRUNC('MONTH', TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') + INTERVAL '1 month' * gs.month_num) 
        - INTERVAL '1 day'
      )
    )
  )::NUMERIC AS "refInterest",

  'Pending' AS "refPrincipalStatus",

  gs.month_num AS "refRepaymentNumber",

  (
    ($3::NUMERIC / pd."refProductDuration"::INTEGER) +
    (
      (
        ($3::NUMERIC * (pd."refProductInterest"::INTEGER * 12) / 100) / 365
      ) * 
      EXTRACT(
        DAY FROM (
          DATE_TRUNC('MONTH', TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') + INTERVAL '1 month' * gs.month_num) 
          - INTERVAL '1 day'
        )
      )
    )
  )::NUMERIC AS "refRepaymentAmount",

  $11 AS "createdAt",
  $12 AS "createdBy",
  NULL AS "refBankFId",

  CASE
    WHEN gs.month_num <= $16 THEN 'paid'
    ELSE 'Pending'
  END AS "refInterestStatus"

FROM inserted_refLoan ir
JOIN product_details pd ON ir."refProductId"::INTEGER = pd."refProductId"::INTEGER
JOIN generate_series(1, pd."refProductDuration"::INTEGER) AS gs(month_num) ON true;

`;

export const getUserList = `SELECT
  u."refUserId",
  u."refUserFname",
  u."refUserLname",
  u."refCustId",
  u."refAadharNo",
  u."refPanNo",
  rc."refUserMobileNo",
  rc."refUserEmail",
  rc."refUserAddress",
  rc."refUserDistrict",
  rc."refUserState",
  rc."refUserPincode",
  ra."refAreaName",
  ra."refAreaPrefix",
  rr."refRName"
FROM
  public."users" u
  LEFT JOIN public."refCommunication" rc ON CAST(rc."refUserId" AS INTEGER) = u."refUserId"
  LEFT JOIN public."refArea" ra ON CAST(ra."refAreaId" AS INTEGER) = rc."refUserAreaId"
  LEFT JOIN public."refReference" rr ON CAST(rr."refUserId" AS INTEGER) = u."refUserId"
WHERE
  u."refUserId" != 1;`;

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
  public."refLoan"
SET
  ("refLoanStatus", "updatedAt", "updatedBy") = ($2, $3, $4)
WHERE
  "refLoanId" = $1
RETURNING
  *;`;

export const insertRepaymentSchedule = `INSERT INTO
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

export const updateBankAccountDebitQuery = `
UPDATE public."refBankAccounts" 
SET 
  "refBalance" = ("refBalance"::numeric - $1),
  "updatedAt" = $3, 
  "updatedBy" = $4
WHERE "refBankId" = $2
RETURNING "refBalance";
`;
export const addNewLoan2 = `WITH
  inserted_refLoan AS (
    INSERT INTO
      public."refLoan" (
        "refUserId",
        "refProductId",
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
        $18
      )
    RETURNING
      "refLoanId",
      "refProductId",
      "refLoanAmount"
  ),
  product_details AS (
    SELECT
      "refProductId",
      "refProductDuration",
      "refProductInterest"
    FROM
      public."refProducts"
    WHERE
      "refProductId"::INTEGER = (
        SELECT
          "refProductId"::INTEGER
        FROM
          inserted_refLoan
      )
  ),
  repayment_input AS (
    SELECT
      ir."refLoanId" AS loan_id,
      ir."refLoanAmount"::NUMERIC AS loan_amount,
      pd."refProductDuration"::INTEGER AS product_duration,
      pd."refProductInterest"::NUMERIC AS product_interest,
      TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS repayment_start_date
    FROM
      inserted_refLoan ir
      JOIN product_details pd ON ir."refProductId"::INTEGER = pd."refProductId"::INTEGER
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
  public."refRepaymentSchedule" (
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
  "refLoanId"
`;

export const addNewLoan3 = `WITH
  inserted_refLoan AS (
    INSERT INTO
      public."refLoan" (
        "refUserId",
        "refProductId",
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
        $19,
        $20
      )
    RETURNING
      "refLoanId",
      "refProductId",
      "refLoanAmount"
  ),
  product_details AS (
    SELECT
      "refProductId",
      "refProductDuration",
      "refProductInterest"
    FROM
      public."refProducts"
    WHERE
      "refProductId"::INTEGER = (
        SELECT
          "refProductId"::INTEGER
        FROM
          inserted_refLoan
      )
  ),
  repayment_input AS (
    SELECT
      ir."refLoanId" AS loan_id,
      ir."refLoanAmount"::NUMERIC AS loan_amount,
      pd."refProductDuration"::INTEGER AS product_duration,
      pd."refProductInterest"::NUMERIC AS product_interest,
      TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS repayment_start_date
    FROM
      inserted_refLoan ir
      JOIN product_details pd ON ir."refProductId"::INTEGER = pd."refProductId"::INTEGER
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
          WHEN $18 = 3 THEN 0
          ELSE r.loan_amount::numeric / r.product_duration::numeric
        END,
        2
      ) AS refPrincipal,
      ROUND(
        CASE
          WHEN $18 IN (1, 3) THEN (
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
        CASE
          WHEN $18 IN (1, 2) THEN (
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
          )
          ELSE (
            r.loan_amount::numeric / r.product_duration::numeric
          ) + (
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
  public."refRepaymentSchedule" (
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

export const addNewLoan4 = `WITH
  inserted_refLoan AS (
    INSERT INTO
      public."refLoan" (
        "refUserId",
        "refProductId",
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
        $19,
        $20
      )
    RETURNING
      "refLoanId",
      "refProductId",
      "refLoanAmount"
  ),
  product_details AS (
    SELECT
      "refProductId",
      "refProductDuration",
      "refProductInterest",
      "refProductDurationType",
      "refProductMonthlyCal"
    FROM
      public."refProducts"
    WHERE
      "refProductId"::INTEGER = (
        SELECT
          "refProductId"::INTEGER
        FROM
          inserted_refLoan
      )
  ),
  repayment_input AS (
    SELECT
      ir."refLoanId" AS loan_id,
      ir."refLoanAmount"::NUMERIC AS loan_amount,
      pd."refProductDuration"::INTEGER AS product_duration,
      pd."refProductInterest"::NUMERIC AS product_interest,
      pd."refProductDurationType"::INTEGER AS duration_type,
      pd."refProductMonthlyCal"::INTEGER AS monthly_cal,
      TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS repayment_start_date
    FROM
      inserted_refLoan ir
      JOIN product_details pd ON ir."refProductId"::INTEGER = pd."refProductId"::INTEGER
  ),
  repayment_schedule AS (
    SELECT
      r.loan_id,
      TO_CHAR(
        CASE
          WHEN r.duration_type = 1 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
          WHEN r.duration_type = 2 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 week'
          WHEN r.duration_type = 3 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 day'
        END,
        'DD-MM-YYYY'
      ) AS refPaymentDate,
      r.loan_amount AS refPaymentAmount,
      ROUND(
        CASE
          WHEN $18 = 3 THEN 0
          ELSE r.loan_amount / r.product_duration
        END,
        2
      ) AS refPrincipal,
      ROUND(
        CASE
          WHEN $18 IN (1, 3) THEN (
            (r.loan_amount * (r.product_interest * 12) / 100) / CASE
              WHEN r.duration_type = 1
              AND r.monthly_cal = 1 THEN 365
              WHEN r.duration_type = 1
              AND r.monthly_cal = 2 THEN 12
              WHEN r.duration_type = 2 THEN 365
              WHEN r.duration_type = 3 THEN 365
              ELSE 1
            END
          ) * CASE
            WHEN r.duration_type = 1 THEN EXTRACT(
              DAY
              FROM
                DATE_TRUNC(
                  'MONTH',
                  r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                ) + INTERVAL '1 month' - INTERVAL '1 day'
            )
            WHEN r.duration_type = 2 THEN 7
            WHEN r.duration_type = 3 THEN 1
            ELSE 1
          END
          WHEN $18 = 2 THEN (
            (
              (
                r.loan_amount - (
                  (r.loan_amount / r.product_duration) * (gs.period_num - 1)
                )
              ) * (r.product_interest * 12) / 100
            ) / CASE
              WHEN r.duration_type = 1
              AND r.monthly_cal = 1 THEN 365
              WHEN r.duration_type = 1
              AND r.monthly_cal = 2 THEN 12
              WHEN r.duration_type = 2 THEN 365
              WHEN r.duration_type = 3 THEN 365
              ELSE 1
            END
          ) * CASE
            WHEN r.duration_type = 1 THEN EXTRACT(
              DAY
              FROM
                DATE_TRUNC(
                  'MONTH',
                  r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                ) + INTERVAL '1 month' - INTERVAL '1 day'
            )
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
          WHEN $18 IN (1, 2) THEN (
            (r.loan_amount / r.product_duration) + CASE
              WHEN $18 = 1 THEN (
                (r.loan_amount * (r.product_interest * 12) / 100) / CASE
                  WHEN r.duration_type = 1
                  AND r.monthly_cal = 1 THEN 365
                  WHEN r.duration_type = 1
                  AND r.monthly_cal = 2 THEN 12
                  WHEN r.duration_type = 2 THEN 365
                  WHEN r.duration_type = 3 THEN 365
                END
              ) * CASE
                WHEN r.duration_type = 1 THEN EXTRACT(
                  DAY
                  FROM
                    DATE_TRUNC(
                      'MONTH',
                      r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                    ) + INTERVAL '1 month' - INTERVAL '1 day'
                )
                WHEN r.duration_type = 2 THEN 7
                WHEN r.duration_type = 3 THEN 1
              END
              WHEN $18 = 2 THEN (
                (
                  (
                    r.loan_amount - (
                      (r.loan_amount / r.product_duration) * (gs.period_num - 1)
                    )
                  ) * (r.product_interest * 12) / 100
                ) / CASE
                  WHEN r.duration_type = 1
                  AND r.monthly_cal = 1 THEN 365
                  WHEN r.duration_type = 1
                  AND r.monthly_cal = 2 THEN 12
                  WHEN r.duration_type = 2 THEN 365
                  WHEN r.duration_type = 3 THEN 365
                END
              ) * CASE
                WHEN r.duration_type = 1 THEN EXTRACT(
                  DAY
                  FROM
                    DATE_TRUNC(
                      'MONTH',
                      r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                    ) + INTERVAL '1 month' - INTERVAL '1 day'
                )
                WHEN r.duration_type = 2 THEN 7
                WHEN r.duration_type = 3 THEN 1
              END
            END
          )
          ELSE (
            (r.loan_amount / r.product_duration) + (
              (r.loan_amount * (r.product_interest * 12) / 100) / CASE
                WHEN r.duration_type = 1
                AND r.monthly_cal = 1 THEN 365
                WHEN r.duration_type = 1
                AND r.monthly_cal = 2 THEN 12
                WHEN r.duration_type = 2 THEN 365
                WHEN r.duration_type = 3 THEN 365
              END
            ) * CASE
              WHEN r.duration_type = 1 THEN EXTRACT(
                DAY
                FROM
                  DATE_TRUNC(
                    'MONTH',
                    r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                  ) + INTERVAL '1 month' - INTERVAL '1 day'
              )
              WHEN r.duration_type = 2 THEN 7
              WHEN r.duration_type = 3 THEN 1
            END
          )
        END,
        2
      ) AS refRepaymentAmount,
      $11 AS createdAt,
      $12 AS createdBy,
      CASE
        WHEN gs.period_num <= $16 THEN 'paid'
        ELSE 'Pending'
      END AS refInterestStatus
    FROM
      repayment_input r
      JOIN generate_series(1, r.product_duration) AS gs (period_num) ON TRUE
  )
INSERT INTO
  public."refRepaymentSchedule" (
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
  "refLoanId";`;

// Version v1
export const addNewLoan5 = `WITH
  inserted_refLoan AS (
    INSERT INTO
      public."refLoan" (
        "refUserId",
        "refProductId",
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
        $19,
        $20
      )
    RETURNING
      "refLoanId",
      "refProductId",
      "refLoanAmount",
      "refCustLoanId"
  ),
  product_details AS (
    SELECT
      "refProductId",
      "refProductDuration",
      "refProductInterest",
      "refProductDurationType",
      "refProductMonthlyCal"
    FROM
      public."refProducts"
    WHERE
      "refProductId"::INTEGER = (
        SELECT
          "refProductId"::INTEGER
        FROM
          inserted_refLoan
      )
  ),
  repayment_input AS (
    SELECT
      ir."refLoanId" AS loan_id,
      ir."refLoanAmount"::NUMERIC AS loan_amount,
      pd."refProductDuration"::INTEGER AS product_duration,
      pd."refProductInterest"::NUMERIC AS product_interest,
      pd."refProductDurationType"::INTEGER AS duration_type,
      pd."refProductMonthlyCal"::INTEGER AS monthly_cal,
      TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS repayment_start_date
    FROM
      inserted_refLoan ir
      JOIN product_details pd ON ir."refProductId"::INTEGER = pd."refProductId"::INTEGER
  ),
  repayment_schedule AS (
    SELECT
      r.loan_id,
      TO_CHAR(
        CASE
          WHEN r.duration_type = 1 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
          WHEN r.duration_type = 2 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 week'
          WHEN r.duration_type = 3 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 day'
        END,
        'DD-MM-YYYY'
      ) AS refPaymentDate,
      r.loan_amount AS refPaymentAmount,
      ROUND(
        CASE
          WHEN $18 = 3 THEN 0
          ELSE r.loan_amount / r.product_duration
        END
      ) AS refPrincipal,
      ROUND(
        CASE
          WHEN $18 IN (1, 3) THEN (
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
          WHEN $18 = 2 THEN (
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
        END
      ) AS refInterest,
      'Pending' AS refPrincipalStatus,
      gs.period_num AS refRepaymentNumber,
      ROUND(
        CASE
          WHEN $18 IN (1, 2) THEN (
            (r.loan_amount / r.product_duration) + CASE
              WHEN $18 = 1 THEN (
                (r.loan_amount * (r.product_interest * 12) / 100) / CASE
                  WHEN r.duration_type = 1
                  AND r.monthly_cal = 1 THEN 365
                  WHEN r.duration_type = 1
                  AND r.monthly_cal = 2 THEN 12
                  WHEN r.duration_type = 2 THEN 365
                  WHEN r.duration_type = 3 THEN 365
                END
              ) * CASE
                WHEN r.duration_type = 1 THEN EXTRACT(
                  DAY
                  FROM
                    DATE_TRUNC(
                      'MONTH',
                      r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                    ) + INTERVAL '1 month' - INTERVAL '1 day'
                )
                WHEN r.duration_type = 2 THEN 7
                WHEN r.duration_type = 3 THEN 1
              END
              WHEN $18 = 2 THEN (
                (
                  (
                    r.loan_amount - (
                      (r.loan_amount / r.product_duration) * (gs.period_num - 1)
                    )
                  ) * (r.product_interest * 12) / 100
                ) / CASE
                  WHEN r.duration_type = 1
                  AND r.monthly_cal = 1 THEN 365
                  WHEN r.duration_type = 1
                  AND r.monthly_cal = 2 THEN 12
                  WHEN r.duration_type = 2 THEN 365
                  WHEN r.duration_type = 3 THEN 365
                END
              ) * CASE
                WHEN r.duration_type = 1 THEN EXTRACT(
                  DAY
                  FROM
                    DATE_TRUNC(
                      'MONTH',
                      r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                    ) + INTERVAL '1 month' - INTERVAL '1 day'
                )
                WHEN r.duration_type = 2 THEN 7
                WHEN r.duration_type = 3 THEN 1
              END
            END
          )
          ELSE (
            (r.loan_amount / r.product_duration) + (
              (r.loan_amount * (r.product_interest * 12) / 100) / CASE
                WHEN r.duration_type = 1
                AND r.monthly_cal = 1 THEN 365
                WHEN r.duration_type = 1
                AND r.monthly_cal = 2 THEN 12
                WHEN r.duration_type = 2 THEN 365
                WHEN r.duration_type = 3 THEN 365
              END
            ) * CASE
              WHEN r.duration_type = 1 THEN EXTRACT(
                DAY
                FROM
                  DATE_TRUNC(
                    'MONTH',
                    r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                  ) + INTERVAL '1 month' - INTERVAL '1 day'
              )
              WHEN r.duration_type = 2 THEN 7
              WHEN r.duration_type = 3 THEN 1
            END
          )
        END
      ) AS refRepaymentAmount,
      $11 AS createdAt,
      $12 AS createdBy,
      CASE
        WHEN gs.period_num <= $16 THEN 'paid'
        ELSE 'Pending'
      END AS refInterestStatus
    FROM
      repayment_input r
      JOIN generate_series(1, r.product_duration) AS gs (period_num) ON TRUE
  )
INSERT INTO
  public."refRepaymentSchedule" (
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

// Version v2
export const addNewLoanV21 = `WITH
  inserted_refLoan AS (
    INSERT INTO
      public."refLoan" (
        "refUserId",
        "refProductId",
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
        $19,
        $20
      )
    RETURNING
      "refLoanId",
      "refProductId",
      "refLoanAmount",
      "refCustLoanId"
  ),
  product_details AS (
    SELECT
      "refProductInterest",
      "refRePaymentType",
      "refLoanDueType",
      "refProductDuration",
      "refInterestCalType",
      "refProductId"
    FROM
      public."refLoanProducts"
    WHERE
      "refProductId"::INTEGER = (
        SELECT
          "refProductId"::INTEGER
        FROM
          inserted_refLoan
      )
  ),
  repayment_input AS (
    SELECT
      ir."refLoanId" AS loan_id,
      ir."refLoanAmount"::NUMERIC AS loan_amount,
      pd."refProductDuration"::INTEGER AS product_duration,
      pd."refProductInterest"::NUMERIC AS product_interest,
      pd."refLoanDueType"::INTEGER AS duration_type,
      pd."refInterestCalType"::INTEGER AS monthly_cal,
      (
        (
          ir."refLoanAmount"::NUMERIC * (
            pd."refProductInterest"::NUMERIC * pd."refProductDuration"::INTEGER
          )
        ) / 100
      ) AS total_interest,
      -- Total duration calculation
      CASE
        WHEN pd."refLoanDueType"::INTEGER = 1 THEN CASE
          WHEN pd."refInterestCalType"::INTEGER = 1 THEN (
            SELECT
              SUM(
                EXTRACT(
                  DAY
                  FROM
                    (
                      date_trunc(
                        'MONTH',
                        TO_TIMESTAMP($6, 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') + (INTERVAL '1 month' * s.i)
                      ) + INTERVAL '1 month - 1 day'
                    )
                )
              )
            FROM
              generate_series(0, pd."refProductDuration"::INTEGER - 1) AS s (i)
          )
          ELSE pd."refProductDuration"::INTEGER
        END
        WHEN pd."refLoanDueType"::INTEGER = 2 THEN CASE
          WHEN pd."refInterestCalType"::INTEGER = 1 THEN pd."refProductDuration"::INTEGER * 7
          ELSE pd."refProductDuration"::INTEGER
        END
        WHEN pd."refLoanDueType"::INTEGER = 3 THEN pd."refProductDuration"::INTEGER
      END AS total_duration,
      TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS repayment_start_date
    FROM
      inserted_refLoan ir
      JOIN product_details pd ON ir."refProductId"::INTEGER = pd."refProductId"::INTEGER
  ),
  repayment_schedule AS (
    SELECT
      r.loan_id,
      TO_CHAR(
        CASE
          WHEN r.duration_type = 1 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
          WHEN r.duration_type = 2 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 week'
          WHEN r.duration_type = 3 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 day'
        END,
        'DD-MM-YYYY'
      ) AS refPaymentDate,
      r.loan_amount AS refPaymentAmount,
      ROUND(
        CASE
          WHEN $18 = 3 THEN 0
          ELSE r.loan_amount / r.product_duration
        END
      ) AS refPrincipal,
      ROUND(
        CASE
          WHEN $18 IN (1, 3) THEN CASE
            WHEN r.monthly_cal = 1 THEN (
              (r.total_interest / r.total_duration) * EXTRACT(
                DAY
                FROM
                  (
                    DATE_TRUNC(
                      'MONTH',
                      r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                    ) + INTERVAL '1 month - 1 day'
                  )
              )
            )
            ELSE (r.total_interest / r.total_duration)
          END
          WHEN $18 = 2 THEN (
            (
              r.loan_amount - (
                (r.loan_amount / r.product_duration) * (gs.period_num - 1)
              )
            ) * (r.product_interest * r.product_duration)
          ) / (
            CASE
              WHEN r.duration_type = 1 THEN CASE
                WHEN r.monthly_cal = 1 THEN (
                  SELECT
                    SUM(
                      EXTRACT(
                        DAY
                        FROM
                          (
                            date_trunc(
                              'MONTH',
                              TO_TIMESTAMP($6, 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"') + (INTERVAL '1 month' * s.i)
                            ) + INTERVAL '1 month - 1 day'
                          )
                      )
                    )
                  FROM
                    generate_series(0, r.product_duration - 1) AS s (i)
                )
                ELSE r.product_duration
              END
              WHEN r.duration_type = 2 THEN CASE
                WHEN r.monthly_cal = 1 THEN (r.product_duration * 7)
                ELSE r.product_duration
              END
              WHEN r.duration_type = 3 THEN r.product_duration
            END
          )
        END
      ) AS refInterest,
      'Pending' AS refPrincipalStatus,
      gs.period_num AS refRepaymentNumber,
      $11 AS createdAt,
      $12 AS createdBy,
      CASE
        WHEN gs.period_num <= $16 THEN 'paid'
        ELSE 'Pending'
      END AS refInterestStatus
    FROM
      repayment_input r
      JOIN generate_series(1, r.product_duration) AS gs (period_num) ON TRUE
  )
INSERT INTO
  public."refRepaymentSchedule" (
    "refLoanId",
    "refPaymentDate",
    "refPaymentAmount",
    "refPrincipal",
    "refInterest",
    "refPrincipalStatus",
    "refRepaymentNumber",
    "createdAt",
    "createdBy",
    "refInterestStatus",
    "refRepaymentAmount",
    "refArears"
  )
SELECT
  loan_id,
  refPaymentDate,
  refPaymentAmount,
  refPrincipal,
  refInterest,
  refPrincipalStatus,
  refRepaymentNumber,
  createdAt,
  createdBy,
  refInterestStatus,
  (
    refPrincipal + CASE
      WHEN refRepaymentNumber <= $16 THEN 0
      ELSE refInterest
    END
  ) AS refRepaymentAmount,
  (
    refPrincipal + CASE
      WHEN refRepaymentNumber <= $16 THEN 0
      ELSE refInterest
    END
  ) AS refArears
FROM
  repayment_schedule
RETURNING
  "refLoanId",
  (
    SELECT
      "refCustLoanId"
    FROM
      inserted_refLoan
    LIMIT
      1
  ) AS "refCustLoanId";`;

export const addNewLoanV22 = `WITH
  inserted_refLoan AS (
    INSERT INTO
      public."refLoan" (
        "refUserId",
        "refProductId",
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
        $19,
        $20
      )
    RETURNING
      "refLoanId",
      "refProductId",
      "refLoanAmount",
      "refCustLoanId"
  ),
  product_details AS (
    SELECT
      "refProductInterest",
      "refRePaymentType",
      "refLoanDueType",
      "refProductDuration",
      "refInterestCalType",
      "refProductId"
    FROM
      public."refLoanProducts"
    WHERE
      "refProductId"::INTEGER = (
        SELECT
          "refProductId"::INTEGER
        FROM
          inserted_refLoan
      )
  ),
  repayment_input AS (
    SELECT
      ir."refLoanId" AS loan_id,
      ir."refLoanAmount"::NUMERIC AS loan_amount,
      pd."refProductDuration"::INTEGER AS product_duration,
      pd."refProductInterest"::NUMERIC AS product_interest,
      pd."refLoanDueType"::INTEGER AS duration_type,
      pd."refInterestCalType"::INTEGER AS monthly_cal,
      (
        ir."refLoanAmount"::NUMERIC * pd."refProductInterest"::NUMERIC * pd."refProductDuration"::NUMERIC
      ) / 100 AS total_interest,
      CASE
        WHEN pd."refLoanDueType" = 1 THEN CASE
          WHEN pd."refInterestCalType" = 1 THEN (
            SELECT
              SUM(
                EXTRACT(
                  DAY
                  FROM
                    (
                      date_trunc(
                        'MONTH',
                        TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') + (INTERVAL '1 month' * s.i)
                      ) + INTERVAL '1 month - 1 day'
                    )
                )
              )
            FROM
              generate_series(0, pd."refProductDuration"::NUMERIC - 1) AS s (i)
          )
          ELSE pd."refProductDuration"::NUMERIC
        END
        WHEN pd."refLoanDueType" = 2 THEN CASE
          WHEN pd."refInterestCalType" = 1 THEN pd."refProductDuration"::NUMERIC * 7
          ELSE pd."refProductDuration"::NUMERIC
        END
        WHEN pd."refLoanDueType" = 3 THEN pd."refProductDuration"::NUMERIC
      END AS total_duration,
      TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS repayment_start_date
    FROM
      inserted_refLoan ir
      JOIN product_details pd ON ir."refProductId"::INTEGER = pd."refProductId"::INTEGER
  ),
  repayment_schedule AS (
    SELECT
      r.loan_id,
      TO_CHAR(
        CASE
          WHEN r.duration_type = 1 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
          WHEN r.duration_type = 2 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 week'
          WHEN r.duration_type = 3 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 day'
        END,
        'DD-MM-YYYY'
      ) AS refPaymentDate,
      r.loan_amount::NUMERIC AS refPaymentAmount,
      ROUND(
        CASE
          WHEN $18 = 3 THEN 0
          ELSE r.loan_amount::NUMERIC / r.product_duration::NUMERIC
        END
      ) AS refPrincipal,
      ROUND(
        CASE
          WHEN $18 IN (1, 3) THEN CASE
            WHEN r.monthly_cal = 1 THEN (r.total_interest::NUMERIC / r.total_duration::NUMERIC) * EXTRACT(
              DAY
              FROM
                (
                  DATE_TRUNC(
                    'MONTH',
                    r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                  ) + INTERVAL '1 month - 1 day'
                )
            )
            ELSE r.total_interest::NUMERIC / r.total_duration::NUMERIC
          END
          WHEN $18 = 2 THEN (
            (
              r.loan_amount::NUMERIC - (
                (r.loan_amount::NUMERIC / r.product_duration::NUMERIC) * (gs.period_num - 1)
              )
            ) * (r.product_interest::NUMERIC * r.product_duration::NUMERIC)
          ) / (
            CASE
              WHEN r.duration_type = 1 THEN CASE
                WHEN r.monthly_cal = 1 THEN (
                  SELECT
                    SUM(
                      EXTRACT(
                        DAY
                        FROM
                          (
                            date_trunc(
                              'MONTH',
                              TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') + (INTERVAL '1 month' * s.i)
                            ) + INTERVAL '1 month - 1 day'
                          )
                      )
                    )
                  FROM
                    generate_series(0, r.product_duration::NUMERIC - 1) AS s (i)
                )
                ELSE r.product_duration::NUMERIC
              END
              WHEN r.duration_type = 2 THEN CASE
                WHEN r.monthly_cal = 1 THEN r.product_duration::NUMERIC * 7
                ELSE r.product_duration::NUMERIC
              END
              WHEN r.duration_type = 3 THEN r.product_duration
            END
          )
        END
      ) AS refInterest,
      'Pending' AS refPrincipalStatus,
      gs.period_num AS refRepaymentNumber,
      $11 AS createdAt,
      $12 AS createdBy,
      CASE
        WHEN gs.period_num <= $16 THEN 'paid'
        ELSE 'Pending'
      END AS refInterestStatus
    FROM
      repayment_input r
      JOIN generate_series(1, r.product_duration::NUMERIC) AS gs (period_num) ON TRUE
  )
INSERT INTO
  public."refRepaymentSchedule" (
    "refLoanId",
    "refPaymentDate",
    "refPaymentAmount",
    "refPrincipal",
    "refInterest",
    "refPrincipalStatus",
    "refRepaymentNumber",
    "createdAt",
    "createdBy",
    "refInterestStatus",
    "refRepaymentAmount",
    "refArears",
    "refPaidInterest"
  )
SELECT
  loan_id,
  refPaymentDate,
  refPaymentAmount,
  refPrincipal,
  refInterest,
  refPrincipalStatus,
  refRepaymentNumber,
  createdAt,
  createdBy,
  refInterestStatus,
  (
    refPrincipal::NUMERIC + CASE
      WHEN refRepaymentNumber <= $16 THEN 0
      ELSE refInterest::NUMERIC
    END
  ) AS refRepaymentAmount,
  (
    refPrincipal::NUMERIC + CASE
      WHEN refRepaymentNumber <= $16 THEN 0
      ELSE refInterest::NUMERIC
    END
  ) AS refArears,
  (
    CASE
      WHEN refRepaymentNumber <= $16 THEN refInterest::NUMERIC
      ELSE 0
    END
  ) AS paidInterest
FROM
  repayment_schedule
RETURNING
  "refLoanId",
  (
    SELECT
      "refCustLoanId"
    FROM
      inserted_refLoan
    LIMIT
      1
  ) AS "refCustLoanId";`;

export const addNewLoan = `WITH
  inserted_refLoan AS (
    INSERT INTO
      public."refLoan" (
        "refUserId",
        "refProductId",
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
        $19,
        $20
      )
    RETURNING
      "refLoanId",
      "refProductId",
      "refLoanAmount",
      "refCustLoanId"
  ),
  product_details AS (
    SELECT
      "refProductInterest"::NUMERIC,
      "refRePaymentType",
      "refLoanDueType"::NUMERIC,
      "refProductDuration"::NUMERIC,
      "refInterestCalType"::NUMERIC,
      "refProductId"::NUMERIC
    FROM
      public."refLoanProducts"
    WHERE
      "refProductId"::NUMERIC = (
        SELECT
          "refProductId"::NUMERIC
        FROM
          inserted_refLoan
      )
  ),
  repayment_input AS (
    SELECT
      ir."refLoanId" AS loan_id,
      ir."refLoanAmount"::NUMERIC AS loan_amount,
      pd."refProductDuration" AS product_duration,
      pd."refProductInterest" AS product_interest,
      pd."refLoanDueType" AS duration_type,
      pd."refInterestCalType" AS monthly_cal,
      (
        ir."refLoanAmount"::NUMERIC * pd."refProductInterest" * pd."refProductDuration"
      ) / 100 AS total_interest,
      CASE
        WHEN pd."refLoanDueType" = 1 THEN CASE
          WHEN pd."refInterestCalType" = 1 THEN (
            SELECT
              SUM(
                EXTRACT(
                  DAY
                  FROM
                    (
                      date_trunc(
                        'MONTH',
                        TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') + (INTERVAL '1 month' * s.i)
                      ) + INTERVAL '1 month - 1 day'
                    )
                )
              )
            FROM
              generate_series(0, pd."refProductDuration" - 1) AS s (i)
          )
          ELSE pd."refProductDuration"
        END
        WHEN pd."refLoanDueType" = 2 THEN CASE
          WHEN pd."refInterestCalType" = 1 THEN pd."refProductDuration" * 7
          ELSE pd."refProductDuration"
        END
        WHEN pd."refLoanDueType" = 3 THEN pd."refProductDuration"
      END AS total_duration,
      TO_TIMESTAMP($6, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS repayment_start_date
    FROM
      inserted_refLoan ir
      JOIN product_details pd ON ir."refProductId"::NUMERIC = pd."refProductId"
  ),
  repayment_schedule AS (
    SELECT
      r.loan_id,
      TO_CHAR(
        CASE
          WHEN r.duration_type = 1 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
          WHEN r.duration_type = 2 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 week'
          WHEN r.duration_type = 3 THEN r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 day'
        END,
        'DD-MM-YYYY'
      ) AS refPaymentDate,
      r.loan_amount AS refPaymentAmount,
      ROUND(
        CASE
          WHEN $18::NUMERIC = 3 THEN 0
          WHEN gs.period_num = r.product_duration THEN r.loan_amount - (
            (
              ROUND(r.loan_amount / r.product_duration) * (r.product_duration - 1)
            )
          )
          ELSE ROUND(r.loan_amount / r.product_duration)
        END
      ) AS refPrincipal,
      ROUND(
        CASE
          WHEN $18::NUMERIC IN (1, 3) THEN -- Flat or Interest First
          CASE
            WHEN r.monthly_cal = 1 THEN (r.total_interest / r.total_duration) * CASE
              WHEN r.duration_type = 1 THEN EXTRACT(
                DAY
                FROM
                  (
                    DATE_TRUNC(
                      'MONTH',
                      r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                    ) + INTERVAL '1 month - 1 day'
                  )
              )
              WHEN r.duration_type = 2 THEN 7
              WHEN r.duration_type = 3 THEN 1
            END
            ELSE r.total_interest / r.total_duration
          END
          WHEN $18::NUMERIC = 2 THEN -- Diminishing
          CASE
            WHEN r.monthly_cal = 1 THEN (
              (
                (
                  r.loan_amount - (r.loan_amount / r.product_duration) * (gs.period_num - 1)
                ) * (r.product_interest * r.product_duration)
              ) / 100
            ) / CASE
              WHEN r.duration_type = 1 THEN (
                SELECT
                  SUM(
                    EXTRACT(
                      DAY
                      FROM
                        (
                          DATE_TRUNC(
                            'MONTH',
                            TO_TIMESTAMP($6, 'YYYY-MM-DD') + (INTERVAL '1 month' * s.i)
                          ) + INTERVAL '1 month - 1 day'
                        )
                    )
                  )
                FROM
                  generate_series(0, r.product_duration - 1) AS s (i)
              )
              WHEN r.duration_type = 2 THEN 7 * r.product_duration
              WHEN r.duration_type = 3 THEN r.product_duration
            END * CASE
              WHEN r.duration_type = 1 THEN EXTRACT(
                DAY
                FROM
                  (
                    DATE_TRUNC(
                      'MONTH',
                      r.repayment_start_date + (gs.period_num - 1) * INTERVAL '1 month'
                    ) + INTERVAL '1 month - 1 day'
                  )
              )
              WHEN r.duration_type = 2 THEN 7
              WHEN r.duration_type = 3 THEN 1
            END
            ELSE (
              (
                r.loan_amount - (r.loan_amount / r.product_duration) * (gs.period_num - 1)
              ) * r.product_interest
            ) / 100
          END
        END,
        0
      ) AS refInterest,
      'Pending' AS refPrincipalStatus,
      gs.period_num AS refRepaymentNumber,
      $11 AS createdAt,
      $12 AS createdBy,
      CASE
        WHEN gs.period_num <= $16::NUMERIC THEN 'paid'
        ELSE 'Pending'
      END AS refInterestStatus
    FROM
      repayment_input r
      JOIN generate_series(1, r.product_duration) AS gs (period_num) ON TRUE
  )
INSERT INTO
  public."refRepaymentSchedule" (
    "refLoanId",
    "refPaymentDate",
    "refPaymentAmount",
    "refPrincipal",
    "refInterest",
    "refPrincipalStatus",
    "refRepaymentNumber",
    "createdAt",
    "createdBy",
    "refInterestStatus",
    "refRepaymentAmount",
    "refArears",
    "refPaidInterest"
  )
SELECT
  loan_id,
  refPaymentDate,
  refPaymentAmount,
  refPrincipal,
  refInterest,
  refPrincipalStatus,
  refRepaymentNumber,
  createdAt,
  createdBy,
  refInterestStatus,
  (refPrincipal + refInterest) AS refRepaymentAmount,
  (
    refPrincipal + CASE
      WHEN refRepaymentNumber <= $16::NUMERIC THEN 0
      ELSE refInterest
    END
  ) AS refArears,
  CASE
    WHEN refRepaymentNumber <= $16::NUMERIC THEN refInterest
    ELSE 0
  END AS paidInterest
FROM
  repayment_schedule
RETURNING
  "refLoanId",
  (
    SELECT
      "refCustLoanId"
    FROM
      inserted_refLoan
    LIMIT
      1
  ) AS "refCustLoanId";`;

export const getProductsDurationQuery1 = `SELECT
  rp."refProductDuration",
  rp."refProductDurationType",
  rp."refProductMonthlyCal"
FROM
  public."refProducts" rp
WHERE
  rp."refProductId" = $1
`;
export const getProductsDurationQuery = `SELECT
  "refProductInterest",
  "refRePaymentType",
  "refLoanDueType",
  "refProductDuration",
  "refInterestCalType"
FROM
  public."refLoanProducts"
  WHERE "refProductId" = $1
`;

export const getBankQuery = `SELECT * FROM public."refBankAccounts" rba
WHERE rba."refBankId" = $1;
`;

export const getLoanType = `SELECT * FROM public."refLoanType" WHERE "refVisible" = true`;
export const getRepaymentType = `SELECT * FROM public."refRepaymentType" WHERE "refVisible" = true`;
