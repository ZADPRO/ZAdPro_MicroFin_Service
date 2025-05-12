import { number } from "@hapi/joi";
import { CurrentTime, dayInterest } from "./common";
import { executeQuery } from "./db";

// const getLoanData = `WITH
//   "getData" AS (
//     SELECT
//       l."refLoanId",
//       l."isInterestFirst",
//       l."refInterestMonthCount",
//       rp."refProductInterest",
//       rp."refProductDuration",
//       l."refLoanAmount",
//       l."createdAt",
//       l."refInitialInterest",
//       l."refRepaymentStartDate",
//       COUNT(
//         CASE
//           WHEN rs."refInterestStatus" = 'paid' THEN 1
//         END
//       ) AS "paidInterestCount",
//       COUNT(
//         CASE
//           WHEN rs."refInterestStatus" = 'paid'
//           AND rs."refPrincipalStatus" = 'paid' THEN 1
//         END
//       ) AS "paidLoanCount",
//       ROUND(
//         COALESCE(
//           (
//             SELECT
//               SUM(CAST(rs."refPrincipal" AS NUMERIC))
//             FROM
//               public."refRepaymentSchedule" rs
//             WHERE
//               CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
//               AND rs."refPrincipalStatus" = 'paid'
//           ),
//           0
//         )::NUMERIC,
//         2
//       ) AS "totalPrincipal",
//       ROUND(
//         COALESCE(
//           (
//             SELECT
//               SUM(CAST(rs."refInterest" AS NUMERIC))
//             FROM
//               public."refRepaymentSchedule" rs
//             WHERE
//               CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
//               AND rs."refInterestStatus" = 'paid'
//           ),
//           0
//         )::NUMERIC
//       ) AS "totalInterest",
//       ROUND(
//         (
//           COALESCE(l."refLoanAmount"::NUMERIC, 0)::NUMERIC * (
//             COALESCE(rp."refProductInterest"::NUMERIC, 0)::NUMERIC / 100
//           ) * COALESCE(l."refInterestMonthCount"::NUMERIC, 0)
//         ),
//         2
//       ) AS "InterestFirst",
//       CASE
//         WHEN TO_CHAR(
//           TO_TIMESTAMP(l."createdAt", 'DD/MM/YYYY, HH:MI:SS PM') AT TIME ZONE 'Asia/Kolkata',
//           'MM/YYYY'
//         ) = TO_CHAR(
//           TO_TIMESTAMP($2, 'DD/MM/YYYY, HH:MI:SS PM') AT TIME ZONE 'Asia/Kolkata',
//           'MM/YYYY'
//         ) THEN true
//         ELSE false
//       END AS "same_Month"
//     FROM
//       public."refLoan" l
//       LEFT JOIN public."refRepaymentSchedule" rs ON CAST(l."refLoanId" AS INTEGER) = rs."refLoanId"::NUMERIC
//       LEFT JOIN public."refProducts" rp ON CAST(rp."refProductId" AS INTEGER) = l."refProductId"::NUMERIC
//     WHERE
//       l."refLoanId" = $1
//     GROUP BY
//       l."refLoanId",
//       l."isInterestFirst",
//       l."refInterestMonthCount",
//       rp."refProductInterest",
//       rp."refProductDuration",
//       l."refLoanAmount"
//   )
// SELECT
//   *,
//   GREATEST(
//     (
//       (
//         EXTRACT(
//           YEAR
//           FROM
//             (TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'))
//         ) * 12 + EXTRACT(
//           MONTH
//           FROM
//             (TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'))
//         )
//       ) - (
//         EXTRACT(
//           YEAR
//           FROM
//             (ga."refRepaymentStartDate"::timestamp)
//         ) * 12 + EXTRACT(
//           MONTH
//           FROM
//             (ga."refRepaymentStartDate"::timestamp)
//         )
//       )
//     ),
//     0
//   ) AS "month_difference",
//   GREATEST(
//     EXTRACT(
//       DAY
//       FROM
//         (TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'))
//     ),
//     0
//   ) AS "DayCount",
//   GREATEST(
//     EXTRACT(
//       DAY
//       FROM
//         (
//           DATE_TRUNC(
//             'MONTH',
//             TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')
//           ) + INTERVAL '1 MONTH' - INTERVAL '1 day'
//         )
//     ),
//     0
//   ) AS "dayCountInMonth"
// FROM
//   "getData" ga;`;

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
        )::NUMERIC,
        2
      ) AS "totalInterest",
      -- Calculate total days in the months covered by refInterestMonthCount
      (
        SELECT
          SUM(
            EXTRACT(
              DAY
              FROM
                (
                  DATE_TRUNC(
                    'month',
                    (l."refRepaymentStartDate"::timestamp) + (n || ' month')::interval
                  ) + INTERVAL '1 month - 1 day'
                )
            )
          )
        FROM
          generate_series(0, l."refInterestMonthCount" - 1) AS n
      ) AS "totalDaysInMonths",
      -- Updated InterestFirst calculation using totalDaysInMonths instead of just month count
      CAST(
        (
          (
            COALESCE(l."refLoanAmount"::NUMERIC, 0) * (
              COALESCE(rp."refProductInterest"::NUMERIC, 0) * 12
            )
          ) / (100 * 365)
        ) * (
          SELECT
            SUM(
              EXTRACT(
                DAY
                FROM
                  (
                    DATE_TRUNC(
                      'month',
                      (l."refRepaymentStartDate"::timestamp) + (n || ' month')::interval
                    ) + INTERVAL '1 month - 1 day'
                  )
              )
            )
          FROM
            generate_series(0, l."refInterestMonthCount" - 1) AS n
        ) AS NUMERIC(10, 2)
      ) AS "InterestFirst",
      CASE
        WHEN TO_CHAR(
          TO_TIMESTAMP(l."createdAt", 'DD/MM/YYYY, HH:MI:SS PM') AT TIME ZONE 'Asia/Kolkata',
          'MM/YYYY'
        ) = TO_CHAR(
          TO_TIMESTAMP(
            $2,
            'DD/MM/YYYY, HH:MI:SS PM'
          ) AT TIME ZONE 'Asia/Kolkata',
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
      l."refLoanAmount",
      l."createdAt",
      l."refInitialInterest",
      l."refRepaymentStartDate"
  )
SELECT
  *,
  GREATEST(
    (
      (
        EXTRACT(
          YEAR
          FROM
            TO_TIMESTAMP(
              $2,
              'DD/MM/YYYY, HH12:MI:SS AM'
            )
        ) * 12 + EXTRACT(
          MONTH
          FROM
            TO_TIMESTAMP(
              $2,
              'DD/MM/YYYY, HH12:MI:SS AM'
            )
        )
      ) - (
        EXTRACT(
          YEAR
          FROM
            ga."refRepaymentStartDate"::timestamp
        ) * 12 + EXTRACT(
          MONTH
          FROM
            ga."refRepaymentStartDate"::timestamp
        )
      )
    ),
    0
  ) AS "month_difference",
  GREATEST(
    EXTRACT(
      DAY
      FROM
        TO_TIMESTAMP(
          $2,
          'DD/MM/YYYY, HH12:MI:SS AM'
        )
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
            TO_TIMESTAMP(
              $2,
              'DD/MM/YYYY, HH12:MI:SS AM'
            )
          ) + INTERVAL '1 MONTH - 1 day'
        )
    ),
    0
  ) AS "dayCountInMonth"
FROM
  "getData" ga;`;

const adminGetLoanData = `WITH
  "getData" AS (
    SELECT
      l."refLoanId",
      l."isInterestFirst",
      l."refInterestMonthCount",
      l."refLoanDuration" AS "refProductDuration",
      l."refLoanInterest" AS "refProductInterest",
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
        )::NUMERIC,
        2
      ) AS "totalInterest",
      -- Calculate total days in the months covered by refInterestMonthCount
      (
        SELECT
          SUM(
            EXTRACT(
              DAY
              FROM
                (
                  DATE_TRUNC(
                    'month',
                    (l."refRepaymentStartDate"::timestamp) + (n || ' month')::interval
                  ) + INTERVAL '1 month - 1 day'
                )
            )
          )
        FROM
          generate_series(0, l."refInterestMonthCount" - 1) AS n
      ) AS "totalDaysInMonths",
      -- Updated InterestFirst calculation using totalDaysInMonths instead of just month count
      CAST(
        (
          (
            COALESCE(l."refLoanAmount"::NUMERIC, 0) * (COALESCE(l."refLoanInterest"::NUMERIC, 0) * 12)
          ) / (100 * 365)
        ) * (
          SELECT
            SUM(
              EXTRACT(
                DAY
                FROM
                  (
                    DATE_TRUNC(
                      'month',
                      (l."refRepaymentStartDate"::timestamp) + (n || ' month')::interval
                    ) + INTERVAL '1 month - 1 day'
                  )
              )
            )
          FROM
            generate_series(0, l."refInterestMonthCount" - 1) AS n
        ) AS NUMERIC(10, 2)
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
      adminloan."refLoan" l
      LEFT JOIN public."refRepaymentSchedule" rs ON CAST(l."refLoanId" AS INTEGER) = rs."refLoanId"::NUMERIC
    WHERE
      l."refLoanId" = $1
    GROUP BY
      l."refLoanId",
      l."isInterestFirst",
      l."refInterestMonthCount",
      l."refLoanDuration",
      l."refLoanInterest",
      l."refLoanAmount",
      l."createdAt",
      l."refInitialInterest",
      l."refRepaymentStartDate"
  )
SELECT
  *,
  GREATEST(
    (
      (
        EXTRACT(
          YEAR
          FROM
            TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')
        ) * 12 + EXTRACT(
          MONTH
          FROM
            TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')
        )
      ) - (
        EXTRACT(
          YEAR
          FROM
            ga."refRepaymentStartDate"::timestamp
        ) * 12 + EXTRACT(
          MONTH
          FROM
            ga."refRepaymentStartDate"::timestamp
        )
      )
    ),
    0
  ) AS "month_difference",
  GREATEST(
    EXTRACT(
      DAY
      FROM
        TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')
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
          ) + INTERVAL '1 MONTH - 1 day'
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
const adminMonthEqual = `SELECT
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

const adminTotalPreMonthInterest = `SELECT
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

const adminGetDayDeefference = `SELECT
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
  adminloan."refLoan" l
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

const adminMonthCheck = `SELECT
  TO_CHAR(
    TO_TIMESTAMP($2, 'DD/MM/YYYY, HH:MI:SS PM') AT TIME ZONE 'Asia/Kolkata',
    'MM/YYYY'
  ) = TO_CHAR(rl."refLoanDueDate"::DATE, 'MM/YYYY') AS "check"
FROM
  adminloan."refLoan" rl
WHERE
  rl."refLoanId" = $1;`;

const newLoanBalanceCalculation = `SELECT
  l."refLoanId",
  l."refLoanAmount",
  l."createdAt",
  rp."refProductId",
  rp."refProductInterest",
  rp."refProductDuration",
  l."isInterestFirst",
  l."refInitialInterest",
  l."refInterestMonthCount",
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
  ) AS "PaidPrincipal",
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
    )::NUMERIC,
    2
  ) AS "PaidInterest",
  CASE
    WHEN TO_CHAR(
      TO_TIMESTAMP($2, 'DD/MM/YYYY, HH:MI:SS PM') AT TIME ZONE 'Asia/Kolkata',
      'MM/YYYY'
    ) = TO_CHAR(
      TO_TIMESTAMP(l."createdAt", 'DD/MM/YYYY, HH:MI:SS PM') AT TIME ZONE 'Asia/Kolkata',
      'MM/YYYY'
    ) THEN GREATEST(
      DATE_PART(
        'day',
        TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM') - TO_TIMESTAMP(l."createdAt", 'DD/MM/YYYY, HH12:MI:SS AM')
      ) + 1,
      0
    )
    ELSE 0
  END AS "Same_Month",
  GREATEST(
    (
      DATE_TRUNC(
        'MONTH',
        TO_TIMESTAMP(l."createdAt", 'DD/MM/YYYY, HH12:MI:SS AM')
      ) + INTERVAL '1 MONTH' - INTERVAL '1 day'
    )::DATE - TO_TIMESTAMP(l."createdAt", 'DD/MM/YYYY, HH12:MI:SS AM')::DATE + 1,
    0
  ) AS "InitialInterestDaysCount",
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
  ) AS "dayCountInMonth",
  (
    DATE_PART(
      'year',
      TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')
    ) * 12 + DATE_PART(
      'month',
      TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')
    )
  ) - (
    DATE_PART('year', l."refRepaymentStartDate"::timestamp) * 12 + DATE_PART('month', l."refRepaymentStartDate"::timestamp)
  ) + 1 AS "CompletedMonth",
  (
    SELECT
      COUNT(*)
    FROM
      public."refRepaymentSchedule" rs
    WHERE
      CAST(rs."refLoanId" AS INTEGER) = CAST(l."refLoanId" AS INTEGER)
      AND rs."refPaymentDate" BETWEEN TO_CHAR(l."refRepaymentStartDate"::timestamp, 'YYYY-MM') AND TO_CHAR(
        TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'),
        'YYYY-MM'
      )
      AND rs."refPrincipalStatus" = 'paid'
      AND rs."refInterestStatus" = 'paid'
  ) AS "LoanPaidMonth",
  CASE
    WHEN (
      DATE_PART(
        'year',
        TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')
      ) * 12 + DATE_PART(
        'month',
        TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')
      )
    ) - (
      DATE_PART('year', l."refRepaymentStartDate"::timestamp) * 12 + DATE_PART('month', l."refRepaymentStartDate"::timestamp)
    ) + 1 > (
      SELECT
        COUNT(*)
      FROM
        public."refRepaymentSchedule" rs
      WHERE
        CAST(rs."refLoanId" AS INTEGER) = CAST(l."refLoanId" AS INTEGER)
        AND rs."refPaymentDate" BETWEEN TO_CHAR(l."refRepaymentStartDate"::timestamp, 'YYYY-MM') AND TO_CHAR(
          TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'),
          'YYYY-MM'
        )
        AND rs."refPrincipalStatus" = 'paid'
        AND rs."refInterestStatus" = 'paid'
    ) THEN false
    ELSE true
  END AS "LoanPaidStatus",
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
          AND rs."refPaymentDate" < TO_CHAR(
            TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'),
            'YYYY-MM'
          )
      ),
      0
    )::NUMERIC,
    2
  ) AS "InterestBeforeMonth",
  (
    DATE_PART(
      'day',
      TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')
    ) + 1
  ) AS "DaysInMonthUptoDate",
  (
    SELECT
      SUM(rs."refInterest"::NUMERIC)
    FROM
      public."refRepaymentSchedule" rs
    WHERE
      rs."refLoanId"::INTEGER = $1
      AND rs."refPaymentDate" = TO_CHAR(
        TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'),
        'YYYY-MM'
      )
  ) AS "CurrentMonthInterest"
  
FROM
  public."refLoan" l
  INNER JOIN public."refProducts" rp ON CAST(rp."refProductId" AS INTEGER) = l."refProductId"::INTEGER
  INNER JOIN public."refRepaymentSchedule" rs ON CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
WHERE
  l."refLoanId" = $1
GROUP BY
  l."refLoanId",
  rp."refProductId",
  rp."refProductInterest",
  rp."refProductDuration",
  l."createdAt"`;

const sameMonthCheck = `SELECT
  TO_CHAR(l."refLoanStartDate"::date, 'MM/YYYY') = TO_CHAR(
    TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'),
    'MM/YYYY'
  ) AS "isSameMonthYear",
  (
    TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')::date - l."refLoanStartDate"::date + 1
  ) AS "CompletedDays",
  (
    DATE_TRUNC(
      'month',
      TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')
    ) + INTERVAL '1 month - 1 day'
  )::date - TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')::date AS "RemainingDays"
FROM
  public."refLoan" l
WHERE
  l."refLoanId" = $1;`;

const adminSameMonthCheck = `SELECT
  TO_CHAR(l."refLoanStartDate"::date, 'MM/YYYY') = TO_CHAR(
    TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM'),
    'MM/YYYY'
  ) AS "isSameMonthYear",
  (
    TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')::date - l."refLoanStartDate"::date + 1
  ) AS "CompletedDays",
  (
    DATE_TRUNC(
      'month',
      TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')
    ) + INTERVAL '1 month - 1 day'
  )::date - TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')::date AS "RemainingDays"
FROM
  adminloan."refLoan" l
WHERE
  l."refLoanId" = $1;`;

export const TopUpBalance = async (loanId: any) => {
  try {
    const loanData = await executeQuery(getLoanData, [loanId, CurrentTime()]);
    let balanceAmt =
      loanData[0].refLoanAmount - Number(loanData[0].totalPrincipal);
    let ToMonthInterestPaid = loanData[0].paidInterestCount;
    let TotalInterestPaid = Number(loanData[0].totalInterest);
    let totalInitialInterest = Number(loanData[0].refInitialInterest);
    const dayInt: any = await dayInterest(
      Number(loanData[0].refLoanAmount),
      Number(loanData[0].refProductInterest)
    );
    if (loanData[0].isInterestFirst) {
      if (
        Number(loanData[0].paidInterestCount) >
        loanData[0].refInterestMonthCount
      ) {
        const result = await executeQuery(monthEqual, [loanId, CurrentTime()]);
        console.log("result line ---- 417", result);

        const dayIntPaid = Number(loanData[0].DayCount) * dayInt;
        console.log(" -> Line Number ----------------------------------- 420");
        if (result[0].check) {
          const amt = Number(result[0].refInterest) - dayIntPaid;
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
          let IntAmt = Number(loanData[0].DayCount) * dayInt;
          IntAmt = IntAmt + Number(preMonInt[0].TotalInterest || 0);
          balanceAmt = balanceAmt - (TotalInterestPaid - IntAmt);
          TotalInterestPaid = IntAmt;
        } else {
          const intAmtResult = await executeQuery(getDayDefference, [
            loanId,
            CurrentTime(),
          ]);

          let intAmt = Number(dayInt) * Number(intAmtResult[0].daysDifference);
          const extIntAmt =
            Number(loanData[0].refInitialInterest) - Number(intAmt);

          balanceAmt =
            balanceAmt - (extIntAmt + Number(loanData[0].InterestFirst));
          TotalInterestPaid = intAmt;
          console.log("TotalInterestPaid line ----- 266", TotalInterestPaid);
        }
      }
    } else {
      const monthCheckResult: any = await executeQuery(sameMonthCheck, [
        loanId,
        CurrentTime(),
      ]);
      const dayIntPaid = Number(loanData[0].DayCount) * dayInt;

      if (monthCheckResult[0].isSameMonthYear) {
        balanceAmt =
          Number(balanceAmt) -
          Number(monthCheckResult[0].RemainingDays) * Number(dayInt);
        console.log("Number(dayInt)", Number(dayInt));
        console.log(
          "Number(monthCheckResult[0].RemainingDays)",
          Number(monthCheckResult[0].RemainingDays)
        );
        console.log("balanceAmt", balanceAmt);
      } else {
        console.log('loanId', loanId)
        console.log('CurrentTime()', CurrentTime())
        const result = await executeQuery(monthEqual, [loanId, CurrentTime()]);
        console.log('result line ---- 945', result)
        if (result[0].check) {
          const amt = Number(result[0].refInterest) - dayIntPaid;
          balanceAmt = balanceAmt - amt;
          TotalInterestPaid = TotalInterestPaid - amt;
        } else {
          balanceAmt = balanceAmt + dayIntPaid;
          TotalInterestPaid = TotalInterestPaid + dayIntPaid;
        }
      }
    }

    const loanCalData = {
      totalLoanAmt: loanData[0].refLoanAmount,
      loanInterest: loanData[0].refProductInterest,
      loanDuration: loanData[0].refProductDuration,
      interestFirst: loanData[0].isInterestFirst,
      initialInterest: loanData[0].refInitialInterest,
      interestFirstMonth: loanData[0].refInterestMonthCount,
      totalPrincipal: Number(loanData[0].totalPrincipal).toFixed(2),
      totalInterest: Number(loanData[0].totalInterest).toFixed(2),
      totalInterestPaid: Number(TotalInterestPaid).toFixed(2),
      totalInitialInterest: Number(totalInitialInterest).toFixed(2),
      totalLoanPaidDuration: loanData[0].paidLoanCount,
      finalBalanceAmt: Number(balanceAmt).toFixed(2),
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

export const adminTopUpBalance = async (loanId: any) => {
  try {
    const loanData = await executeQuery(adminGetLoanData, [
      loanId,
      CurrentTime(),
    ]);
    let balanceAmt =
      loanData[0].refLoanAmount - Number(loanData[0].totalPrincipal);
    let ToMonthInterestPaid = loanData[0].paidInterestCount;
    let TotalInterestPaid = Number(loanData[0].totalInterest);
    let totalInitialInterest = Number(loanData[0].refInitialInterest);
    const dayInt: any = await dayInterest(
      Number(loanData[0].refLoanAmount),
      Number(loanData[0].refProductInterest)
    );
    if (loanData[0].isInterestFirst) {
      if (
        Number(loanData[0].paidInterestCount) >
        loanData[0].refInterestMonthCount
      ) {
        const result = await executeQuery(adminMonthEqual, [
          loanId,
          CurrentTime(),
        ]);
        console.log("result line ---- 417", result);

        const dayIntPaid = Number(loanData[0].DayCount) * dayInt;
        console.log(" -> Line Number ----------------------------------- 420");
        if (result[0].check) {
          const amt = Number(result[0].refInterest) - dayIntPaid;
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
          const preMonInt = await executeQuery(adminTotalPreMonthInterest, [
            loanId,
            CurrentTime(),
          ]);
          let IntAmt = Number(loanData[0].DayCount) * dayInt;
          IntAmt = IntAmt + Number(preMonInt[0].TotalInterest || 0);
          balanceAmt = balanceAmt - (TotalInterestPaid - IntAmt);
          TotalInterestPaid = IntAmt;
        } else {
          const intAmtResult = await executeQuery(adminGetDayDeefference, [
            loanId,
            CurrentTime(),
          ]);

          let intAmt = Number(dayInt) * Number(intAmtResult[0].daysDifference);
          const extIntAmt =
            Number(loanData[0].refInitialInterest) - Number(intAmt);

          balanceAmt =
            balanceAmt - (extIntAmt + Number(loanData[0].InterestFirst));
          TotalInterestPaid = intAmt;
          console.log("TotalInterestPaid line ----- 266", TotalInterestPaid);
        }
      }
    } else {
      const monthCheckResult: any = await executeQuery(adminSameMonthCheck, [
        loanId,
        CurrentTime(),
      ]);
      const dayIntPaid = Number(loanData[0].DayCount) * dayInt;

      if (monthCheckResult[0].isSameMonthYear) {
        balanceAmt =
          Number(balanceAmt) -
          Number(monthCheckResult[0].RemainingDays) * Number(dayInt);
        console.log("Number(dayInt)", Number(dayInt));
        console.log(
          "Number(monthCheckResult[0].RemainingDays)",
          Number(monthCheckResult[0].RemainingDays)
        );
        console.log("balanceAmt", balanceAmt);
      } else {
        const result = await executeQuery(adminMonthEqual, [
          loanId,
          CurrentTime(),
        ]);
        if (result[0].check) {
          const amt = Number(result[0].refInterest) - dayIntPaid;
          balanceAmt = balanceAmt - amt;
          TotalInterestPaid = TotalInterestPaid - amt;
        } else {
          balanceAmt = balanceAmt + dayIntPaid;
          TotalInterestPaid = TotalInterestPaid + dayIntPaid;
        }
      }
    }

    const loanCalData = {
      totalLoanAmt: loanData[0].refLoanAmount,
      loanInterest: loanData[0].refProductInterest,
      loanDuration: loanData[0].refProductDuration,
      interestFirst: loanData[0].isInterestFirst,
      initialInterest: loanData[0].refInitialInterest,
      interestFirstMonth: loanData[0].refInterestMonthCount,
      totalPrincipal: Number(loanData[0].totalPrincipal).toFixed(2),
      totalInterest: Number(loanData[0].totalInterest).toFixed(2),
      totalInterestPaid: Number(TotalInterestPaid).toFixed(2),
      totalInitialInterest: Number(totalInitialInterest).toFixed(2),
      totalLoanPaidDuration: loanData[0].paidLoanCount,
      finalBalanceAmt: Number(balanceAmt).toFixed(2),
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
  console.log(" -> Line Number ----------------------------------- 520");
  if (checkResult[0].check) {
    const loanData = await executeQuery(getLoanData, [loanId, CurrentTime()]);
    let balanceAmt =
      loanData[0].refLoanAmount - Number(loanData[0].totalPrincipal);
    let TotalInterestPaid = Number(loanData[0].totalInterest);
    const result = await executeQuery(monthEqual, [loanId, CurrentTime()]);
    const dayInt: any = await dayInterest(
      Number(loanData[0].refLoanAmount),
      Number(loanData[0].refProductInterest)
    );
    const dayIntPaid = Number(loanData[0].DayCount) * dayInt;
    console.log(" -> Line Number ----------------------------------- 531");
    if (result[0].check) {
      const amt = Number(result[0].refInterest) - dayIntPaid;
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
export const adminExtensionBalance = async (loanId: any) => {
  const checkResult = await executeQuery(adminMonthCheck, [
    loanId,
    CurrentTime(),
  ]);
  console.log(" -> Line Number ----------------------------------- 520");
  if (checkResult[0].check) {
    const loanData = await executeQuery(adminGetLoanData, [
      loanId,
      CurrentTime(),
    ]);
    let balanceAmt =
      loanData[0].refLoanAmount - Number(loanData[0].totalPrincipal);
    let TotalInterestPaid = Number(loanData[0].totalInterest);
    const result = await executeQuery(adminMonthEqual, [loanId, CurrentTime()]);
    const dayInt: any = await dayInterest(
      Number(loanData[0].refLoanAmount),
      Number(loanData[0].refProductInterest)
    );
    const dayIntPaid = Number(loanData[0].DayCount) * dayInt;
    console.log(" -> Line Number ----------------------------------- 531");
    if (result[0].check) {
      const amt = Number(result[0].refInterest) - dayIntPaid;
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
