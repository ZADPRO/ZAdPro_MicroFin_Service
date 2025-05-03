export const loanCount = `SELECT
  COUNT(*) AS total_loans,
  ROUND(COALESCE(SUM(rl."refLoanAmount"::NUMERIC), 0), 2) AS total_loan_amount,
  ROUND(COALESCE(SUM(rl."refInitialInterest"::NUMERIC), 0), 2) AS "Total_initial_interest"
FROM
  public."refLoan" rl
WHERE
  TO_CHAR(rl."refLoanStartDate"::timestamp, 'YYYY-MM') = $1;`;

export const paidLoan = `SELECT
  COUNT(*) AS "paid_count",
  ROUND(COALESCE(SUM(rp."refPrincipal"::NUMERIC), 0), 1) AS "total_paid_principal",
  ROUND(COALESCE(SUM(rp."refInterest"::NUMERIC), 0), 1) AS "total_paid_interest"
FROM
  public."refRepaymentSchedule" rp
WHERE
  rp."refPaymentDate" = $1 AND rp."refPrincipalStatus" = 'paid';`;

export const loanNotPaid = `WITH
  count AS (
    SELECT
      COUNT(*) AS "not_paid_count"
    FROM
      public."refRepaymentSchedule" rp
    WHERE
      rp."refPaymentDate" = $1
      AND rp."refPrincipalStatus" = 'Pending'
  ),
  total_amount AS (
    SELECT
      SUM(rl."refLoanAmount"::INTEGER) AS total_loan_amount,
      (
        SELECT
          not_paid_count
        FROM
          count
      ) AS not_paid_count,
      ARRAY_AGG(rl."refLoanId") AS loan_ids
    FROM
      public."refRepaymentSchedule" rp
      LEFT JOIN public."refLoan" rl ON CAST(rl."refLoanId" AS INTEGER) = rp."refLoanId"::INTEGER
    WHERE
      rp."refPrincipalStatus" = 'Pending'
      AND rp."refPaymentDate" = $1
  )
SELECT
  SUM(rp."refPrincipal"::INTEGER) AS "Paid_amount",
  (
    SELECT
      total_loan_amount
    FROM
      total_amount
  ) AS total_loan_amount,
  (
    SELECT
      not_paid_count
    FROM
      total_amount
  ) AS not_paid_count,
  (
    SELECT
      loan_ids
    FROM
      total_amount
  ) AS loanId
FROM
  public."refRepaymentSchedule" rp
WHERE
  rp."refLoanId"::INTEGER = ANY (
    string_to_array(
      regexp_replace(
        (
          SELECT
            loan_ids
          FROM
            total_amount
        )::text,
        '[{}]',
        '',
        'g'
      ),
      ','
    )::INTEGER[]
  )
  AND rp."refPrincipalStatus" = 'paid'`;
