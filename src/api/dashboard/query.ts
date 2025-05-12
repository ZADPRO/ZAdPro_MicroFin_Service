export const loanCount = `SELECT
  COUNT(*) AS total_loans,
  ROUND(COALESCE(SUM(rl."refLoanAmount"::NUMERIC), 0), 2) AS total_loan_amount,
  ROUND(COALESCE(SUM(rl."refInitialInterest"::NUMERIC), 0), 2) AS "Total_initial_interest"
FROM
  public."refLoan" rl
WHERE
  TO_CHAR(rl."refLoanStartDate"::timestamp, 'YYYY-MM') = $1;`;

export const paidLoan = `SELECT
COUNT(*) FILTER (
  WHERE
    rp."refInterestStatus" = 'paid'
    OR rp."refPrincipalStatus" = 'paid'
) AS "paid_count",
ROUND(
  COALESCE(
    SUM(
      CASE
        WHEN rp."refPrincipalStatus" = 'paid' THEN NULLIF(rp."refPrincipal", 'null')::NUMERIC
        ELSE 0
      END
    ),
    0
  ),
  1
) AS "total_paid_principal",
ROUND(
  COALESCE(
    SUM(
      CASE
        WHEN rp."refInterestStatus" = 'paid' THEN NULLIF(rp."refInterest", 'null')::NUMERIC
        ELSE 0
      END
    ),
    0
  ),
  1
) AS "total_paid_interest"
FROM
public."refRepaymentSchedule" rp
WHERE
rp."refPaymentDate" = $1;`;

export const loanNotPaid = `SELECT
COUNT(*) FILTER (
  WHERE
    rp."refInterestStatus" = 'Pending'
    OR rp."refPrincipalStatus" = 'Pending'
) AS "not_paid_count",

ROUND(
  COALESCE(
    SUM(
      CASE
        WHEN rp."refPrincipalStatus" = 'Pending'
        THEN NULLIF(rp."refPrincipal", 'null')::NUMERIC
        ELSE 0
      END
    ),
    0
  ),
  1
) AS "total_not_paid_principal",

ROUND(
  COALESCE(
    SUM(
      CASE
        WHEN rp."refInterestStatus" = 'Pending'
        THEN NULLIF(rp."refInterest", 'null')::NUMERIC
        ELSE 0
      END
    ),
    0
  ),
  1
) AS "total_not_paid_interest"
FROM
public."refRepaymentSchedule" rp
WHERE
rp."refPaymentDate" = $1;`;

export const adminLoanCount = `SELECT
  COUNT(*) AS total_loans,
  ROUND(COALESCE(SUM(rl."refLoanAmount"::NUMERIC), 0), 2) AS total_loan_amount,
  ROUND(COALESCE(SUM(rl."refInitialInterest"::NUMERIC), 0), 2) AS "Total_initial_interest"
FROM
  adminloan."refLoan" rl
WHERE
  TO_CHAR(rl."refLoanStartDate"::timestamp, 'YYYY-MM') = $1;`;

export const adminPaidLoan = `SELECT
COUNT(*) FILTER (
  WHERE
    rp."refInterestStatus" = 'paid'
    OR rp."refPrincipalStatus" = 'paid'
) AS "paid_count",
ROUND(
  COALESCE(
    SUM(
      CASE
        WHEN rp."refPrincipalStatus" = 'paid' THEN NULLIF(rp."refPrincipal", 'null')::NUMERIC
        ELSE 0
      END
    ),
    0
  ),
  1
) AS "total_paid_principal",
ROUND(
  COALESCE(
    SUM(
      CASE
        WHEN rp."refInterestStatus" = 'paid' THEN NULLIF(rp."refInterest", 'null')::NUMERIC
        ELSE 0
      END
    ),
    0
  ),
  1
) AS "total_paid_interest"
FROM
adminloan."refRepaymentSchedule" rp
WHERE
rp."refPaymentDate" = $1;`;

export const adminLoanNotPaid = `SELECT
COUNT(*) FILTER (
  WHERE
    rp."refInterestStatus" = 'Pending'
    OR rp."refPrincipalStatus" = 'Pending'
) AS "not_paid_count",

ROUND(
  COALESCE(
    SUM(
      CASE
        WHEN rp."refPrincipalStatus" = 'Pending'
        THEN NULLIF(rp."refPrincipal", 'null')::NUMERIC
        ELSE 0
      END
    ),
    0
  ),
  1
) AS "total_not_paid_principal",

ROUND(
  COALESCE(
    SUM(
      CASE
        WHEN rp."refInterestStatus" = 'Pending'
        THEN NULLIF(rp."refInterest", 'null')::NUMERIC
        ELSE 0
      END
    ),
    0
  ),
  1
) AS "total_not_paid_interest"
FROM
adminloan."refRepaymentSchedule" rp
WHERE
rp."refPaymentDate" = $1;`;
