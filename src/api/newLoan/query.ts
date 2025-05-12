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
export const updateBankFundQuery = `INSERT INTO 
   public."refBankFund" (
     "refBankId",
     "refbfTransactionDate",
     "refbfTrasactionType",  
     "refbfTransactionAmount",
     "refTxnId",
     "refFundType", 
     "createdAt",
     "createdBy"
      )
 VALUES
   ($1, $2, $3, $4, $5, $6, $7, $8)
   RETURNING *;`;
export const updateLoan = `UPDATE
  public."refLoan"
SET
  ("refLoanStatus", "updatedAt", "updatedBy") = ($2, $3, $4)
WHERE
  "refLoanId" = $1
RETURNING
  *;`;

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

export const getProductsDurationQuery = `SELECT
  rp."refProductDuration"
FROM
  public."refProducts" rp
WHERE
  rp."refProductId" = $1
`;

export const getBankQuery = `SELECT * FROM public."refBankAccounts" rba
WHERE rba."refBankId" = $1;
`;
