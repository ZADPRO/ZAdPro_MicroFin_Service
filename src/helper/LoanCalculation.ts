import { number } from "@hapi/joi";
import { CurrentTime, dayInterest, formatDate_Time } from "./common";
import { executeQuery } from "./db";
import {
  parse,
  format,
  addMonths,
  addWeeks,
  addDays,
  differenceInCalendarDays,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
} from "date-fns";

const getLoanData = `WITH
  "getData" AS (
    SELECT
      l."refLoanId",
      l."isInterestFirst",
      l."refInterestMonthCount",
      rp."refProductInterest",
      rp."refProductDuration",
      rp."refProductDurationType",
      rp."refProductMonthlyCal",
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
        )::NUMERIC
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
      rp."refProductDurationType",
      rp."refProductMonthlyCal",
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

const adminGetLoanData1 = `WITH
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
        )::NUMERIC
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
              adminloan."refRepaymentSchedule" rs
            WHERE
              CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
              AND rs."refPrincipalStatus" = 'paid'
          ),
          0
        )::NUMERIC
      ) AS "totalPrincipal",
      ROUND(
        COALESCE(
          (
            SELECT
              SUM(CAST(rs."refInterest" AS NUMERIC))
            FROM
              adminloan."refRepaymentSchedule" rs
            WHERE
              CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
              AND rs."refInterestStatus" = 'paid'
          ),
          0
        )::NUMERIC
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
      LEFT JOIN adminloan."refRepaymentSchedule" rs ON CAST(l."refLoanId" AS INTEGER) = rs."refLoanId"::NUMERIC
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
const adminMonthEqualV1 = `SELECT
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
  END AS "check",
  rs."refInterest"
FROM
  adminloan."refRepaymentSchedule" rs
WHERE
  rs."refLoanId"::INTEGER = $1
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
    )::NUMERIC
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
    )::NUMERIC
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
    )::NUMERIC
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
    )::NUMERIC
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
    )::NUMERIC
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
          balanceAmt = Math.round(balanceAmt - amt);
          TotalInterestPaid = TotalInterestPaid - amt;
          console.log("TotalInterestPaid line ----- 232", TotalInterestPaid);
        } else {
          balanceAmt = Math.round(balanceAmt + dayIntPaid);
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
          balanceAmt = Math.round(balanceAmt - (TotalInterestPaid - IntAmt));
          TotalInterestPaid = IntAmt;
        } else {
          const intAmtResult = await executeQuery(getDayDefference, [
            loanId,
            CurrentTime(),
          ]);

          let intAmt = Number(dayInt) * Number(intAmtResult[0].daysDifference);
          const extIntAmt =
            Number(loanData[0].refInitialInterest) - Number(intAmt);

          balanceAmt = Math.round(
            balanceAmt - (extIntAmt + Number(loanData[0].InterestFirst))
          );
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
        balanceAmt = Math.round(
          Number(balanceAmt) -
            Number(monthCheckResult[0].RemainingDays) * Number(dayInt)
        );
        console.log("Number(dayInt)", Number(dayInt));
        console.log(
          "Number(monthCheckResult[0].RemainingDays)",
          Number(monthCheckResult[0].RemainingDays)
        );
        console.log("balanceAmt", balanceAmt);
      } else {
        console.log("loanId", loanId);
        console.log("CurrentTime()", CurrentTime());
        const result = await executeQuery(monthEqual, [loanId, CurrentTime()]);
        console.log("result line ---- 945", result);
        if (result[0].check) {
          const amt = Number(result[0].refInterest) - dayIntPaid;
          balanceAmt = Math.round(balanceAmt - amt);
          TotalInterestPaid = TotalInterestPaid - amt;
        } else {
          balanceAmt = Math.round(balanceAmt + dayIntPaid);
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
      durationType: Number(loanData[0].refProductDurationType),
      interestCalType: Number(loanData[0].refProductMonthlyCal),
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

export const adminTopUpBalance = async (loanId: any, date?: Date) => {
  const todayDate = date ?? CurrentTime();
  try {
    const loanData = await executeQuery(adminGetLoanData, [
      loanId,
      formatDate_Time(todayDate),
    ]);
    console.log("loanData line --------------- > 998", loanData);
    let balanceAmt =
      loanData[0].refLoanAmount - Number(loanData[0].totalPrincipal);
    console.log(" -> Line Number ----------------------------------- 1041");
    let ToMonthInterestPaid = loanData[0].paidInterestCount;
    console.log(" -> Line Number ----------------------------------- 1043");
    let TotalInterestPaid = Number(loanData[0].totalInterest);
    console.log(" -> Line Number ----------------------------------- 1045");
    let totalInitialInterest = Number(loanData[0].refInitialInterest);
    console.log(" -> Line Number ----------------------------------- 1047");
    const dayInt: any = await dayInterest(
      Number(loanData[0].refLoanAmount),
      Number(loanData[0].refProductInterest)
    );
    console.log(" -> Line Number ----------------------------------- 1052");
    if (loanData[0].isInterestFirst) {
      console.log(" -> Line Number ----------------------------------- 1054");
      if (
        Number(loanData[0].paidInterestCount) >
        loanData[0].refInterestMonthCount
      ) {
        console.log(" -> Line Number ----------------------------------- 1059");
        const result = await executeQuery(adminMonthEqual, [
          loanId,
          formatDate_Time(todayDate),
        ]);
        console.log("result line ---- 417", result);

        const dayIntPaid = Number(loanData[0].DayCount) * dayInt;
        console.log(" -> Line Number ----------------------------------- 420");
        if (result[0].check) {
          const amt = Number(result[0].refInterest) - dayIntPaid;
          balanceAmt = Math.round(balanceAmt - amt);
          TotalInterestPaid = TotalInterestPaid - amt;
          console.log("TotalInterestPaid line ----- 232", TotalInterestPaid);
        } else {
          balanceAmt = Math.round(balanceAmt + dayIntPaid);
          TotalInterestPaid = 0;
          console.log("TotalInterestPaid line ----- 236", TotalInterestPaid);
          totalInitialInterest =
            totalInitialInterest - (totalInitialInterest - dayIntPaid);
        }
      } else {
        console.log(" -> Line Number ----------------------------------- 1081");
        if (!loanData[0].same_Month) {
          const preMonInt = await executeQuery(adminTotalPreMonthInterest, [
            loanId,
            formatDate_Time(todayDate),
          ]);
          let IntAmt = Number(loanData[0].DayCount) * dayInt;
          IntAmt = IntAmt + Number(preMonInt[0].TotalInterest || 0);
          balanceAmt = Math.round(balanceAmt - (TotalInterestPaid - IntAmt));
          TotalInterestPaid = IntAmt;
        } else {
          const intAmtResult = await executeQuery(adminGetDayDeefference, [
            loanId,
            formatDate_Time(todayDate),
          ]);

          let intAmt = Number(dayInt) * Number(intAmtResult[0].daysDifference);
          const extIntAmt =
            Number(loanData[0].refInitialInterest) - Number(intAmt);

          balanceAmt = Math.round(
            balanceAmt - (extIntAmt + Number(loanData[0].InterestFirst))
          );
          TotalInterestPaid = intAmt;
          console.log("TotalInterestPaid line ----- 266", TotalInterestPaid);
        }
      }
    } else {
      console.log(" -> Line Number ----------------------------------- 1109");
      console.log(" -> Line Number ----------------------------------- 1107");
      const monthCheckResult: any = await executeQuery(adminSameMonthCheck, [
        loanId,
        formatDate_Time(todayDate),
      ]);
      console.log(" -> Line Number ----------------------------------- 1115");
      const dayIntPaid = Number(loanData[0].DayCount) * dayInt;
      console.log(" -> Line Number ----------------------------------- 1117");
      if (monthCheckResult[0].isSameMonthYear) {
        console.log(" -> Line Number ----------------------------------- 1119");
        balanceAmt = Math.round(
          Number(balanceAmt) -
            Number(monthCheckResult[0].RemainingDays) * Number(dayInt)
        );
        console.log("Number(dayInt)", Number(dayInt));
        console.log(
          "Number(monthCheckResult[0].RemainingDays)",
          Number(monthCheckResult[0].RemainingDays)
        );
        console.log("balanceAmt", balanceAmt);
      } else {
        console.log(" -> Line Number ----------------------------------- 1131");
        const result = await executeQuery(adminMonthEqual, [
          loanId,
          formatDate_Time(todayDate),
        ]);
        console.log("\n\n result line ---------- 1136", result);
        console.log(" -> Line Number ----------------------------------- 1136");
        if (result[0].check) {
          console.log(
            " -> Line Number ----------------------------------- 1137"
          );
          const amt = Number(result[0].refInterest) - dayIntPaid;
          balanceAmt = Math.round(balanceAmt - amt);
          TotalInterestPaid = TotalInterestPaid - amt;
        } else {
          console.log(
            " -> Line Number ----------------------------------- 1142"
          );
          balanceAmt = Math.round(balanceAmt + dayIntPaid);
          TotalInterestPaid = TotalInterestPaid + dayIntPaid;
        }
      }
    }
    console.log(" -> Line Number ----------------------------------- 1143");
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

// Version 2 For Calculating the Loan Closing balance

interface LoanInfo {
  refLoanId: number;
  refLoanAmount: string; // stored as string from DB
  totalPrincipalPaid: string;
  totalInterestPaid: string;
  refInitialInterest: string;
  interestPaidFirstAmount: string;
  refInterestMonthCount: number;
  refProductDuration: string;
  refProductInterest: string;
  refLoanDueType: number; // 1 = Monthly, 2 = Weekly, 3 = Daily
  refInterestCalType: number; // 1 = Daywise, 2 = Overall
  refRePaymentType: number; // 1 = Flat, 2 = Diminishing, 3 = Interest-Based
  refRepaymentStartDate: string; // YYYY-MM-DD
  refSettingValue: number; // 1 = completed only, 2 = full period
  createdAt: string;
  isInterestFirst: boolean;
}

export const loanDetailData = `SELECT
  l."refLoanId",
  l."refLoanAmount",
  l."createdAt",
  l."isInterestFirst",
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

export const getSetting = `SELECT
  *
FROM
  settings."refSettings" s
WHERE
  s."refSettingId" = ANY ($1)
`;

export const getPaidInterest = `SELECT
  rs."refPaymentDate",
  CAST(rs."refPaidInterest" AS NUMERIC) AS "refPaidInterest",
  rs."refInterest",
  CASE
    WHEN $4 = 1 THEN
      TO_CHAR(TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY'), 'MM-YYYY') =
      TO_CHAR(TO_TIMESTAMP($5, 'DD/MM/YYYY, HH12:MI:SS AM'), 'MM-YYYY')

    WHEN $4 = 2 THEN
      DATE_TRUNC('week', TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY') + INTERVAL '1 day') =
      DATE_TRUNC('week', TO_TIMESTAMP($5, 'DD/MM/YYYY, HH12:MI:SS AM') + INTERVAL '1 day')

    WHEN $4 = 3 THEN
      TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY') =
      DATE(TO_TIMESTAMP($5, 'DD/MM/YYYY, HH12:MI:SS AM'))

    ELSE FALSE
  END AS "matchDate",
  CASE
    WHEN $4 = 1 THEN
      EXTRACT(DAY FROM DATE_TRUNC('MONTH', TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY') + INTERVAL '1 month') 
        - DATE_TRUNC('MONTH', TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY')))
    WHEN $4 = 2 THEN 7
    WHEN $4 = 3 THEN 1
    ELSE 0
  END AS "totalDays",
  CASE
    WHEN $4 = 1 AND TO_CHAR(TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY'), 'MM-YYYY') =
                    TO_CHAR(TO_TIMESTAMP($5, 'DD/MM/YYYY, HH12:MI:SS AM'), 'MM-YYYY')
    THEN
      EXTRACT(DAY FROM TO_TIMESTAMP($5, 'DD/MM/YYYY, HH12:MI:SS AM'))

    WHEN $4 = 2 AND DATE_TRUNC('week', TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY') + INTERVAL '1 day') =
                  DATE_TRUNC('week', TO_TIMESTAMP($5, 'DD/MM/YYYY, HH12:MI:SS AM') + INTERVAL '1 day')
    THEN
      EXTRACT(DAY FROM TO_TIMESTAMP($5, 'DD/MM/YYYY, HH12:MI:SS AM')) -
      EXTRACT(DAY FROM DATE_TRUNC('week', TO_TIMESTAMP($5, 'DD/MM/YYYY, HH12:MI:SS AM') + INTERVAL '1 day')) + 1

    WHEN $4 = 3 AND TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY') =
                  DATE(TO_TIMESTAMP($5, 'DD/MM/YYYY, HH12:MI:SS AM'))
    THEN 1

    ELSE 0
  END AS "completedDays"

FROM
  public."refRepaymentSchedule" rs
WHERE
  rs."refLoanId"::INTEGER = $1
  AND (
    CASE
      WHEN $2 = 0 THEN TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY') >= TO_DATE($3, 'YYYY-MM-DD')
      ELSE TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY') >= CASE
        WHEN $4 = 1 THEN TO_DATE($3, 'YYYY-MM-DD') + ($2 || ' months')::INTERVAL
        WHEN $4 = 2 THEN TO_DATE($3, 'YYYY-MM-DD') + ($2 * 7 || ' days')::INTERVAL
        WHEN $4 = 3 THEN TO_DATE($3, 'YYYY-MM-DD') + ($2 || ' days')::INTERVAL
      END
    END
  )
ORDER BY
  TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY') ASC;`;

// to validate the INitial Interest Condation
export async function analyzeLoanPeriodMatch(
  dateStr1: string,
  todayStr: string,
  refLoanDueType: number,
  weekDays?: string
): Promise<{
  isPeriodMatched: boolean;
  totalRemainingDays: number;
  completedDays: number;
  totalPeriodDays: number; // ✅ new field
}> {
  const parseDate = (dateStr: string): Date => {
    if (dateStr.includes("/")) {
      const [datePart, timePartWithPeriod] = dateStr.split(", ");
      const [day, month, year] = datePart.split("/").map(Number);

      let [timePart, period] = timePartWithPeriod.split(" ");
      let [hour, minute, second] = timePart.split(":").map(Number);
      if (period.toLowerCase() === "pm" && hour < 12) hour += 12;
      if (period.toLowerCase() === "am" && hour === 12) hour = 0;

      return new Date(year, month - 1, day, hour, minute, second);
    } else {
      return new Date(dateStr);
    }
  };

  const startDate = parseDate(dateStr1);
  const today = parseDate(todayStr);

  const normalizeDate = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const addDays = (date: Date, days: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  const startOfWeek = (date: Date, startDay: number): Date => {
    const day = date.getDay();
    const diff = (day - startDay + 7) % 7;
    return addDays(date, -diff);
  };

  const endOfWeek = (start: Date, startDay: number, endDay: number): Date => {
    const diff = (endDay - startDay + 7) % 7;
    return addDays(start, diff);
  };

  let periodStart: Date = normalizeDate(startDate);
  let periodEnd: Date;
  let totalPeriodDays: number = 0;

  if (refLoanDueType === 1) {
    // Monthly
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    periodEnd = new Date(year, month + 1, 0); // last day of the month
    totalPeriodDays = periodEnd.getDate(); // ✅ days in that month
  } else if (refLoanDueType === 2 && weekDays) {
    const [startDayStr, endDayStr] = weekDays
      .split(",")
      .map((s) => s.trim().toLowerCase());
    const weekMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    const startDay = weekMap[startDayStr];
    const endDay = weekMap[endDayStr];

    periodStart = startOfWeek(startDate, startDay);
    periodEnd = endOfWeek(periodStart, startDay, endDay);
    totalPeriodDays =
      Math.floor(
        (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1; // ✅ usually 7
  } else if (refLoanDueType === 3) {
    // Daily
    periodEnd = normalizeDate(startDate);
    totalPeriodDays = 1; // ✅ one day
  } else {
    throw new Error("Invalid dueType or missing weekDays");
  }

  const isPeriodMatched =
    normalizeDate(today) >= periodStart && normalizeDate(today) <= periodEnd;

  const totalRemainingDays =
    Math.floor(
      (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

  const completedDays =
    Math.floor(
      (normalizeDate(today).getTime() - periodStart.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return {
    isPeriodMatched,
    totalRemainingDays,
    completedDays,
    totalPeriodDays, // ✅ new field returned
  };
}

// to validate the InterestFirst Condation

export async function InterestFirstPayedAmtCheck(
  refRepaymentStartDate: string, // "yyyy-mm-dd"
  inputDateStr: string, // "dd/mm/yyyy, hh:mi:ss am"
  refLoanDueType: number, // 1 = Month, 2 = Week, 3 = Day
  refInterestMonthCount: number,
  weekStartEnd?: string // Only for weekly type
): Promise<{
  totalDays: number;
  checkCondition: boolean;
  completedDays: number;
  currentPeriodIndex: number;
}> {
  const inputDate = parse(inputDateStr.split(",")[0], "dd/MM/yyyy", new Date());
  const startDate = parse(refRepaymentStartDate, "yyyy-MM-dd", new Date());

  let totalDays = 0;
  let checkCondition = false;
  let completedDays = 0;
  let currentPeriodIndex = 0;

  if (refLoanDueType === 1) {
    const monthRanges: { start: Date; end: Date }[] = [];

    for (let i = 0; i < refInterestMonthCount; i++) {
      const monthStart = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1
      );
      const monthEnd = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0
      );
      monthRanges.push({ start: monthStart, end: monthEnd });
      totalDays += differenceInCalendarDays(monthEnd, monthStart) + 1;
    }

    const totalStart = monthRanges[0].start;
    const totalEnd = monthRanges[monthRanges.length - 1].end;
    checkCondition = isWithinInterval(inputDate, {
      start: totalStart,
      end: totalEnd,
    });

    if (checkCondition) {
      completedDays = differenceInCalendarDays(inputDate, totalStart) + 1;
      currentPeriodIndex =
        monthRanges.findIndex(({ start, end }) =>
          isWithinInterval(inputDate, { start, end })
        ) + 1;
    }
  } else if (refLoanDueType === 2 && weekStartEnd) {
    console.log(" -> Line Number ----------------------------------- 1602");
    // 🟩 Weekly logic
    const [weekStartStr] = weekStartEnd.split(",");
    console.log("weekStartStr", weekStartStr);
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weekStartIndex = dayNames.indexOf(weekStartStr.trim());

    const startOfFirstWeek = startOfWeek(startDate, {
      weekStartsOn: weekStartIndex as 0,
    });
    const weekRanges: { start: Date; end: Date }[] = [];

    for (let i = 0; i < refInterestMonthCount; i++) {
      const start = addWeeks(startOfFirstWeek, i);
      const end = addDays(start, 6);
      weekRanges.push({ start, end });
    }
    console.log("weekRanges line ----- 1627", weekRanges);

    const totalStart = weekRanges[0].start;
    const totalEnd = weekRanges[weekRanges.length - 1].end;
    totalDays = refInterestMonthCount * 7;
    checkCondition = isWithinInterval(inputDate, {
      start: totalStart,
      end: totalEnd,
    });

    if (checkCondition) {
      completedDays = differenceInCalendarDays(inputDate, totalStart) + 1;
      currentPeriodIndex =
        weekRanges.findIndex(({ start, end }) =>
          isWithinInterval(inputDate, { start, end })
        ) + 1;
    }
  } else if (refLoanDueType === 3) {
    // 🟨 Daily logic
    const endDate = addDays(startDate, refInterestMonthCount - 1);
    totalDays = refInterestMonthCount;
    checkCondition = isWithinInterval(inputDate, {
      start: startDate,
      end: endDate,
    });

    if (checkCondition) {
      completedDays = differenceInCalendarDays(inputDate, startDate) + 1;
      currentPeriodIndex = completedDays; // Each day is its own period
    }
  }

  return {
    totalDays,
    checkCondition,
    completedDays: checkCondition ? completedDays : 0,
    currentPeriodIndex: checkCondition ? currentPeriodIndex : 0,
  };
}

export const getInterest = async (data: any) => {
  const Interest = (data.refLoanAmount * data.refProductInterest) / 100;
  return Interest;
};

export const getLoanClosingData = async (loanId: number, todayDate: string) => {
  let date = todayDate;
  try {
    const loanData = await executeQuery(loanDetailData, [loanId]);
    const loan: LoanInfo = loanData[0];
    const settingData = await executeQuery(getSetting, [[4, 5, 8]]);
    const data1 = settingData.filter((e) => e.refSettingId === 4);
    const data2 = settingData.filter((e) => e.refSettingId === 5);
    const data3 = settingData.filter((e) => e.refSettingId === 8);
    const Setting = {
      loanClossing: data1[0].refSettingValue,
      weekStartEnd: data2[0].refSettingData,
      advanceAmtCal: data3[0].refSettingValue,
    };
    console.log("\n\nsettingData \n\n", Setting);
    console.log("loanData line -------- 1337", loan);

    //    Balance Loan Calculation Variables
    const loanAmt = loan.refLoanAmount;
    let balanceAmount = Number(loanAmt) - Number(loan.totalPrincipalPaid);
    let initialInterestCheck = await analyzeLoanPeriodMatch(
      loan.createdAt,
      date,
      loan.refLoanDueType,
      Setting.weekStartEnd
    );
    console.log("initialInterestCheck line ------ 1696", initialInterestCheck);
    if (Setting.loanClossing === 1 && initialInterestCheck.isPeriodMatched) {
      const takenAmt =
        (Number(loan.refInitialInterest) /
          initialInterestCheck.totalRemainingDays) *
        initialInterestCheck.completedDays;
      balanceAmount = balanceAmount - takenAmt;
      balanceAmount = balanceAmount - Number(loan.totalInterestPaid);
      console.log("balanceAmount line ------ 1509", balanceAmount);

      return Math.round(balanceAmount);
    }

    if (loan.isInterestFirst) {
      console.log(" -> Line Number ----------------------------------- 1648");
      const interestFirstData = await InterestFirstPayedAmtCheck(
        loan.refRepaymentStartDate,
        date,
        loan.refLoanDueType,
        loan.refInterestMonthCount,
        Setting.weekStartEnd
      );
      console.log("interestFirstData", interestFirstData);

      if (interestFirstData.checkCondition) {
        const dueType =
          Setting.loanClossing === 1
            ? interestFirstData.totalDays
            : Number(loan.refInterestMonthCount);
        const perInterest = Number(loan.interestPaidFirstAmount) / dueType;
        const takenInterest =
          perInterest *
          (Setting.loanClossing === 1
            ? interestFirstData.completedDays
            : Number(interestFirstData.currentPeriodIndex));
        const returnInterest =
          Number(loan.interestPaidFirstAmount) - takenInterest;
        balanceAmount = balanceAmount - returnInterest;
        console.log("returnInterest line -------- 1670", returnInterest);
        console.log("balanceAmount line ------ 1648", balanceAmount);
      }
    }

    const interestParams = [
      loan.refLoanId,
      Number(loan.refInterestMonthCount) ?? 0,
      loan.refRepaymentStartDate,
      loan.refLoanDueType,
      date,
    ];
    const paidInterestList = await executeQuery(
      getPaidInterest,
      interestParams
    );
    console.log("paidInterestList line ------ 1756", paidInterestList);
    let completedInterest = 0;
    let returnInterest = 0;
    let ifTrue = false;
    const interestReturnAmount = paidInterestList.map((e) => {
      if (!ifTrue) {
        if (e.matchDate) {
          ifTrue = true;
          const Interest = Number(e.refInterest);
          if (loan.refLoanDueType === 1) {
            const interestCal =
              (Interest / Number(e.totalDays)) * Number(e.completedDays);
            completedInterest = completedInterest + interestCal;
            returnInterest = Interest - interestCal;
          } else {
            completedInterest = completedInterest + Number(e.refPaidInterest);
          }
        } else {
          completedInterest = completedInterest + Number(e.refPaidInterest);
        }
      } else {
        returnInterest = returnInterest + Number(e.refPaidInterest);
      }
    });
    console.log("completedInterest", completedInterest);
    console.log("returnInterest", returnInterest);
    balanceAmount = balanceAmount - returnInterest;
    console.log("balanceAmount", balanceAmount);

    return Math.round(balanceAmount);
  } catch (error) {
    console.log("error", error);
    return 0;
  }
};



