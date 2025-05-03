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
  rp."refPrincipalStatus" = 'Pending'
  AND rl."refLoanStatus" = 1
  AND (
    $1 = FALSE
    OR (
      $1 = TRUE
      AND rp."refPaymentDate" BETWEEN $2 AND $3
    )
  );`;

export const nameQuery = `SELECT "refUserFname" , "refUserLname" FROM public."users" WHERE "refUserId" = $1
`;

// export const rePaymentCalculation = `SELECT
//   rp."refPaymentDate",
//   rl."refLoanAmount",
//   rpr."refProductName",
//   rpr."refProductInterest",
//   rpr."refProductDuration",
//   rl."isInterestFirst",
//   rl."refLoanStartDate",
//   rl."refRepaymentStartDate",
//   rl."refLoanDueDate",
//   COALESCE((
//     SELECT SUM(rp2."refPrincipal"::INTEGER)
//     FROM public."refRepaymentSchedule" rp2
//     WHERE CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId"
//   ), 0) AS "totalPrincipal",
//   COALESCE((
//     SELECT SUM(rp2."refInterest"::INTEGER)
//     FROM public."refRepaymentSchedule" rp2
//     WHERE CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId"
//   ), 0) AS "totalInterest",
//   COALESCE(rpr."refProductDuration"::INTEGER, 0) - COALESCE((
//     SELECT COUNT(*)
//     FROM public."refRepaymentSchedule" rp3
//     WHERE CAST(rp3."refLoanId" AS INTEGER) = rl."refLoanId"
//       AND rp3."refReStatus" = 'paid'
//   ), 0) AS "refNewDuration"
// FROM
//   public."refLoan" rl
//   INNER JOIN public."refRepaymentSchedule" rp ON CAST(rp."refLoanId" AS INTEGER) = rl."refLoanId"
//   INNER JOIN public."refProducts" rpr ON CAST(rpr."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
// WHERE
//   rl."refLoanId" = $1
//   AND rp."refRpayId" = $2`;

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
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(CAST(rp2."refPrincipal" AS NUMERIC)) -- Cast to NUMERIC
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
          SUM(CAST(rp2."refInterest" AS NUMERIC)) -- Cast to NUMERIC
        FROM
          public."refRepaymentSchedule" rp2
        WHERE
          CAST(rp2."refLoanId" AS INTEGER) = rl."refLoanId"
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
WHERE
  rl."refLoanId" = $1
  AND rp."refRpayId" = $2;`;
export const bankList = `SELECT
  "refBankId",
  "refBankName",
  "refBankAccountNo"
FROM
  public."refBankAccounts"`;

export const updateRePayment = `UPDATE
  public."refRepaymentSchedule"
SET
  (
    "refPrincipal",
    "refInterest",
    "refPrincipalStatus",
    "refRepaymentAmount",
    "updatedAt",
    "updatedBy"
  ) = ($1, $2, $3, $4, $5, $6)
  WHERE "refRpayId" = $7
RETURNING *;`;

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
  ) VALUES ($1,$2,$3,$4,$5)`;

export const loanAudit = `SELECT

  rp."refRpayId" AS "RpayId",
  rp."refLoanId" AS "LoanId",
  rp."refPaymentDate" AS "Month",
  rp."refInterest" AS "Interest",
  rp."refPrincipal" AS "Principal",

  json_agg(
    json_build_object(
      'FollowId', us."refStatusId",
      'Message', us."refMessage",
      'date', us."refNextDate",
      'UpdateAt', us."updatedAt"
    )
  ) AS "followup"
FROM
  public."refRepaymentSchedule" rp
LEFT JOIN public.refuserstatus us 
  ON CAST(us."refRpayId" AS INTEGER) = rp."refRpayId"
WHERE
  rp."refLoanId"::INTEGER = $1
GROUP BY
  rp."refRpayId", rp."refLoanId", rp."refPaymentDate", rp."refInterest", rp."refPrincipal"
ORDER BY
  rp."refRpayId";`;

export const getLoanDetails = `SELECT
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
            CAST(NULLIF(rp2."refInterest", 'null') AS NUMERIC)
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
  INNER JOIN public."refProducts" rpr ON CAST(rpr."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
  INNER JOIN public."refLoanStatus" ls ON CAST (ls."refLoanStatusId" AS INTEGER) = rl."refLoanStatus"
WHERE
  rl."refUserId" = $1
GROUP BY
  rl."refLoanId",
  rpr."refProductName",
  rpr."refProductInterest",
  rpr."refProductDuration",
  ls."refLoanStatus"`;

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
  COALESCE(SUM(rs."refPrincipal"::INTEGER), 0) AS "Total_Amount",
  CAST(rl."refLoanAmount" AS INTEGER) - COALESCE(SUM(rs."refPrincipal"::INTEGER), 0) AS "Balance_Amount"
FROM
  public."refRepaymentSchedule" rs
  LEFT JOIN public."refLoan" rl ON CAST(rl."refLoanId" AS INTEGER) = rs."refLoanId"::INTEGER
WHERE
  rs."refLoanId"::INTEGER = $1
GROUP BY
  rl."refLoanId", rl."refLoanAmount"`;
export const updateLoan = `UPDATE
  public."refLoan"
SET
  ("refLoanStatus", "updatedAt", "updatedBy") = ($2, $3, $4)
WHERE
  "refLoanId" = $1
RETURNING
  *;`;
