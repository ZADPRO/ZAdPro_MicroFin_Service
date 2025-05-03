export const selectUserByLogin = `SELECT u."refUserId", u."refUserFname", u."refUserLname", ud."refUserHashPassword" ,u."refUserRole"
FROM public."users" u
JOIN public."refUserDomain" ud ON u."refUserId" = ud."refUserId"
JOIN public."refCommunication" rc ON u."refUserId" = rc."refUserId"
WHERE rc."refUserMobileNo" = $1 OR u."refCustId" = $1;`;

export const getAgentCountQuery = `
  SELECT COUNT(*) AS count FROM public.users WHERE "refUserRole" = '2';
`;

export const getCustomerCountQuery = `
  SELECT COUNT(*) AS count FROM public.users WHERE "refUserRole" = '3';
`;

export const insertAgentBasicDetails = `
  INSERT INTO public."users" (
    "refUserFname",
    "refUserLname",
    "refCustId",
    "refUserDOB",
    "refAadharNo",
    "refPanNo",
    "refUserRole",
    "refActiveStatus",
    "refUserProfile",
    "refPanPath",
    "refAadharPath",
    "createdAt",
    "createdBy"
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  RETURNING "refUserId";
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
     "createdBy",
     "refPaymentType"
  )
 VALUES
   ($1, $2, $3, $4, $5, $6, $7, $8,$9)
   RETURNING *;`;

export const insertCommunicationQuery = `
  INSERT INTO public."refCommunication" (
    "refUserId",
    "refUserMobileNo",
    "refUserEmail",
    "refUserAddress",
    "refUserDistrict",
    "refUserState",
    "refUserPincode",
    "createdAt",
    "createdBy"
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *;
`;

export const insertDomainQuery = `
  INSERT INTO public."refUserDomain" (
    "refUserId",
    "refUserPassword",
    "refUserHashPassword",
    "createdAt",
    "createdBy"
  )
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *;
`;

export const getCustomersQuery = `SELECT
  *
FROM
  public."users" u
  JOIN public."refCommunication" rc ON rc."refUserId" = u."refUserId"
WHERE
u."refUserRole" = '3' AND  (
    u."refUserId" = $1
   
  );
`;

export const getReferenceQuery = `
SELECT * FROM public."refReference" 
WHERE "refUserId"= $1;
`;

export const getAuditPageQuery = `
SELECT
  rth."refTransactionId",
  rth."refUserId",
  rth."transData",
  rth."updatedAt",
  u."refUserFname"|| ' ' ||u."refUserLname" AS "updatedBy"
FROM
  public."refTxnHistory" rth
  LEFT JOIN public.users u ON u."refUserId"::TEXT = rth."updatedBy"
WHERE
  rth."refUserId" = $1;
`;

export const getAgentQuery = `SELECT
  *
FROM
  public."users" u
  JOIN public."refCommunication" rc ON rc."refUserId" = u."refUserId"
WHERE
u."refUserRole" = '2' AND  (
    u."refUserId" = $1
  );
`;

export const getAgentListQuery = `SELECT
  *
FROM
  public."users" u
  JOIN public."refCommunication" rc ON rc."refUserId" = u."refUserId"
WHERE
u."refUserRole" = '2'
ORDER BY u."refUserId" DESC`;

export const getCustomersListQuery = `SELECT
  *
FROM
  public."users" u
  JOIN public."refCommunication" rc ON rc."refUserId" = u."refUserId"
WHERE
  u."refUserRole" = '3'
ORDER BY
  u."refUserId" DESC`;

export const nameQuery = `SELECT "refUserFname" , "refUserLname" FROM public."users" WHERE "refUserId" = $1
`;
export const userExistsQuery = `SELECT COUNT(*) FROM public.users WHERE "refUserId" = $1;`;

export const updateUserQuery = `UPDATE public."users" 
SET 
    "refUserFname" = $1,
    "refUserLname" = $2,
    "refUserDOB" = $3,
    "refAadharNo" = $4,
    "refPanNo" = $5,
    "refUserRole" = $6,
    "refActiveStatus" = $7,
    "updatedAt" = $8,
    "updatedBy" = $9,
    "refUserProfile" = $10,
    "refPanPath" = $11,
    "refAadharPath" = $12
WHERE "refUserId" = $13
 RETURNING *;
`;

export const updateCommunicationQuery = `UPDATE public."refCommunication"
SET 
    "refUserMobileNo" = $1,
    "refUserEmail" = $2,
    "refUserAddress" = $3,
    "refUserDistrict" = $4,
    "refUserState" = $5,
    "refUserPincode" = $6,
    "updatedAt" = $7,
    "updatedBy" = $8
WHERE "refUserId" = $9
 RETURNING *;
`;

export const updateDomainQuery = `UPDATE public."refUserDomain"
SET 
    "refUserPassword" = $1,
    "refUserHashPassword" = $2,
    "updatedAt" = $3,
    "updatedBy" = $4
WHERE "refUserId" = $5
 RETURNING *;
`;

export const addBankAccountQuery = `INSERT INTO public."refBankAccounts" 
(
"refBankName", 
"refBankAccountNo", 
"refBankAddress",
"refBalance" ,
"refAccountType",
"createdAt",
"createdBy",
"refIFSCsCode"
)
VALUES ($1, $2, $3, $4, $5, $6, $7,$8)
 RETURNING *;`;

export const updateBankAccountQuery = `UPDATE public."refBankAccounts"
SET 
    "refBankName" = $1,
    "refBankAccountNo" = $2,
    "refBankAddress" = $3,
    "updatedAt" = $4,
    "updatedBy" = $5,
    "refIFSCsCode" = $7,
    "refAccountType" = $8
WHERE "refBankId" = $6
 RETURNING *;`;

export const updateHistoryQuery = `INSERT INTO public."refTxnHistory" ("refTransactionId", "refUserId", "transData", "updatedAt", "updatedBy")
  VALUES ($1, $2, $3, $4, $5) RETURNING *;`;

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

export const getrefUserIdQuery = `SELECT "refUserId" 
FROM public."users" 
ORDER BY "refUserId" DESC 
LIMIT 1;`;

export const addBankFundQuery = `INSERT INTO
  public."refBankFund" (
    "refBankId",
    "refbfTransactionDate",
    "refbfTrasactionType",
    "refbfTransactionAmount",
    "refTxnId",
    "refFundType",
    "createdAt",
    "createdBy",
    "refPaymentType"
  )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8,$9)
  RETURNING *;`;

export const getBankListQuery = `SELECT
  ba."refBankId",
  ba."refBankName",
  ba."refAccountType",
  bt."refAccountTypeName",
  ROUND(CAST(NULLIF(ba."refBalance", '') AS NUMERIC), 2) AS "refBalance"
FROM
  public."refBankAccounts" ba
  LEFT JOIN public."refBankAccountType" bt 
    ON CAST(bt."refAccountId" AS INTEGER) = ba."refAccountType"`;

export const updateBankAccountBalanceQuery = `
UPDATE public."refBankAccounts" 
SET 
  "refBalance" = ("refBalance"::numeric + $1),
  "updatedAt" = $3, 
  "updatedBy" = $4
WHERE "refBankId" = $2
RETURNING "refBalance";
`;

export const updateBankAccountDebitQuery = `
UPDATE public."refBankAccounts" 
SET 
  "refBalance" = ("refBalance"::numeric - $1),
  "updatedAt" = $3, 
  "updatedBy" = $4
WHERE "refBankId" = $2
RETURNING "refBalance";
`;

export const addProductQuery = `INSERT INTO
  public."refProducts" (
    "refProductName",
    "refProductInterest",
    "refProductDuration",
    "refProductStatus",
    "refProductDescription",
    "createdAt",
    "createdBy"
  )
VALUES
  ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *;`;

export const updateProductQuery = `UPDATE public."refProducts"
SET
    "refProductName" = $2,
    "refProductInterest" = $3,
    "refProductDuration" = $4,
    "refProductStatus" = $5,
    "refProductDescription" = $6,
    "updatedAt" = $7,
    "updatedBy" = $8
WHERE "refProductId" = $1;
`;

export const getProductsListQuery = `SELECT
  rp."refProductId",
rp."refProductName",
  rp."refProductInterest",
  rp."refProductDuration",
  rp."refProductStatus",
  rp."refProductDescription",
  rp."createdAt",
  rp."createdBy",
  rp."updatedAt",
  rp."updatedBy"
FROM
  public."refProducts" rp
ORDER BY
  "refProductId" DESC; 
`;

export const getProductsQuery = `SELECT *
FROM public."refProducts"
WHERE "refProductName" = $1;
`;

export const getBankFundQueryByrefBankFId = `SELECT * FROM public."refBankFund" WHERE "refBankFId" = $1; 
`;

export const getBankFundQueryByRangeQuery = `SELECT *
FROM (
  SELECT
    bf."refBankId",
    bf."refbfTrasactionType",
    bf."refbfTransactionAmount",
    bf."refbfTransactionDate",
    bf."refBankFId",
    bf."refFundType"
  FROM
    public."refBankFund" bf
  WHERE
    TO_DATE(bf."refbfTransactionDate" || '-01', 'YYYY-MM-DD') 
        BETWEEN TO_DATE($1 || '-01', 'YYYY-MM-DD') 
        AND TO_DATE($2 || '-01', 'YYYY-MM-DD')
  ORDER BY
    bf."refbfTransactionDate" DESC
) AS subquery
ORDER BY
  subquery."refbfTransactionDate" ASC;
`;

export const getBankFundListQuery = `SELECT
  rbf.*,
  rba."refBankName",
  rba."refBankAccountNo",
  bt."refAccountTypeName"
FROM
  public."refBankFund" rbf
  LEFT JOIN public."refBankAccounts" rba ON rba."refBankId" = rbf."refBankId"::INTEGER
  LEFT JOIN public."refBankAccountType" bt ON CAST(bt."refAccountId" AS INTEGER) = rba."refAccountType"
ORDER BY
  rbf."refBankFId" DESC;`;

export const addloanQuery = `INSERT INTO
  public."refLoan" (
    "refUserId",
    "refProductId",
    "refLoanAmount",
    "refLoanDueDate",
    "refPayementType",
    "refRepaymentStartDate",
    "refLoanStatus",
    "refLoanStartDate",
    "refBankId",
    "refLoanBalance",
    "isInterestFirst",
    "refInterest",
    "refPayableAmount",
    "createdAt",
    "createdBy",
    "refLoanExt",
    "refExLoanId",
    "refInterestMonthCount"
  )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,$16,$17,$18)
RETURNING
  *;`;

export const getLoanQuery = `SELECT
  rl.*,
  rrs.*
FROM
  public."refLoan" rl
  JOIN public."refRepaymentSchedule" rrs ON CAST(rrs."refLoanId" AS INTEGER) = rl."refLoanId"
WHERE
  rl."refUserId" = $1;

  `;

export const updateLoanStatusQuery = `
    UPDATE public."refLoan"
     SET "refLoanStatus" = 'closed'
     WHERE "refUserId" = $1
     RETURNING *;
`;

export const updateRepaymentScheduleQuery = `
UPDATE public."refRepaymentSchedule" rrs
SET 
    "refInterest" = 0, 
    "refRepaymentAmount" = rrs."refPrincipal"
FROM public."refLoan" rl 
WHERE CAST(rl."refLoanId" AS INTEGER) = rrs."refLoanId":: INTEGER
AND rl."refUserId" = $1;
`;

export const getloanListQuery = `
SELECT * FROM public."refLoan"`;

export const insertReferenceDetails = `INSERT INTO
  public."refReference" (
    "refUserId",
    "refRName",
    "refRPhoneNumber",
    "refRAddress",
    "refAadharNumber",
    "refPanNumber",
    "createdAt",
    "createdBy"
  )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING
  *;
`;

export const loanQuery = `SELECT 
"refLoanAmount", 
"refRepaymentStartDate", 
"refLoanDueDate", 
"isInterestFirst", 
"refProductId" 
FROM public."refLoan" WHERE "refLoanId" = $1;
`;

export const insertRepaymentQuery = `
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
    "createdBy"
  )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `;

export const getRePaymentScheduleListQuery = `SELECT *
FROM public."refRepaymentSchedule"
WHERE "refPaymentDate" = TO_CHAR(CURRENT_DATE, 'YYYY-MM');`;

export const getProductInterestQuery = `
    SELECT "refProductInterest" 
    FROM public."refProducts" 
    WHERE "refProductId" = $1;
`;

export const insertPaymentQuery = `
               INSERT INTO
  public."refPayments" (
    "refTransactionType",
    "refAmount",
    "refRpayId",
    "refPPaymentDate",
    "refLoanId",
    "refAgentId",
    "createdAt",
    "createdBy"
     )
VALUES
  ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING "refRpayId";
            `;

export const updateRepaymentQuery = `
               UPDATE
  public."refRepaymentSchedule"
SET
  "refPrincipalStatus" = 'paid',
  "updatedAt" = $1,
  "updatedBy" = $2
WHERE
  "refRepaymentNumber" = $3
  OR "refPaymentDate" = $3;
            `;

export const updateUserStatusQuery = `
INSERT INTO
  public."refuserstatus" (
    "refRpayId",
    "resStatus",
    "refFollowUp",
    "refComments",
    "createdAt",
    "createdBy"
     )
VALUES
  ($1, $2, $3, $4, $5, $6)
  RETURNING *;

`;

export const updateFollowUpQuery = `
UPDATE
  "public"."refuserstatus"
SET
  "refRpayId" = $2,
  "resStatus" = $3,
  "refFollowUp" = $4,
  "refComments" = $5,
  "updatedAt" = $6,
  "updatedBy" = $7
WHERE
  "refStatusId" = $1;
`;

export const getUserDetailsQuery = `SELECT 
u.*,
rc.*
FROM public."users" u
JOIN public."refCommunication" rc ON u."refUserId" = rc."refUserId"
WHERE u."refUserId" = $1;
`;

export const getloanUserListQuery = `
SELECT
  u."refUserId",
  u."refCustId",
  u."refUserFname",
  u."refUserLname",
  rc."refUserMobileNo",
  rc."refUserAddress",
  u."refUserRole",
  rc."refUserDistrict",
  rc."refUserState",
  rc."refUserPincode",
  COUNT(
    CASE
      WHEN rl."refLoanStatus" = 1 THEN 1
    END
  ) AS "opened_count",
  COUNT(
    CASE
      WHEN rl."refLoanStatus" = 2 THEN 1
    END
  ) AS "closed_count"
FROM
  public."users" u
  FULL JOIN public."refLoan" rl ON rl."refUserId" = CAST(u."refUserId" AS INTEGER)
  FULL JOIN public."refCommunication" rc ON CAST(rc."refUserId" AS INTEGER) = u."refUserId"
WHERE
  u."refUserRole" = '3'
GROUP BY
  u."refUserId",
  u."refCustId",
  u."refUserFname",
  u."refUserLname",
  rc."refUserMobileNo",
  rc."refUserAddress",
  rc."refUserDistrict",
  rc."refUserState",
  rc."refUserPincode"
`;

export const getLoanDataQuery = `
SELECT 
    rp."refProductId",
    rp."refProductName",
    rp."refProductInterest",
      rp."refProductDuration",
    rl."refLoanAmount" AS "principal",
    ls."refLoanStatus",
    rl."refInterest" AS "interestAmount",
    rl."refPayableAmount",
    rl."refLoanStartDate",
    rl."refLoanDueDate",
    rl."isInterestFirst",
    rl."refLoanId"
FROM public."refProducts" rp
JOIN public."refLoan" rl 
    ON CAST(rl."refProductId" AS INTEGER) = rp."refProductId"
    LEFT JOIN public."refLoanStatus" ls ON CAST (ls."refLoanStatusId" AS INTEGER) = rl."refLoanStatus"
WHERE rl."refUserId" = $1
`;

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

export const getUnPaidUserQuery = `SELECT
  u."refUserId",
  u."refUserFname",
  rc."refUserMobileNo",
  rc."refUserAddress",
  rp."refProductName",
  rl."refLoanAmount",
  rl."refLoanBalance"
FROM
  public."refRepaymentSchedule" rs
  LEFT JOIN public."refLoan" rl ON CAST(rl."refLoanId" AS INTEGER) = rs."refLoanId"::INTEGER
  LEFT JOIN public."users" u ON CAST(u."refUserId" AS INTEGER) = rl."refUserId"::INTEGER
  LEFT JOIN public."refCommunication" rc ON CAST ( rc."refUserId" AS INTEGER) = u."refUserId"
  LEFT JOIN public."refProducts" rp ON CAST ( rp."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
WHERE
  rs."refPrincipalStatus" IS NOT null

`;

export const getAmountDataQuery = `
SELECT
  rl."refLoanId",
  rl."refUserId",
  rl."refProductId",
  rl."refLoanAmount" AS "PrincipleAmount",
  rl."refLoanStatus",
  rl."refLoanBalance",
  rp."refProductName",
  rp."refProductInterest",
  rp."refProductDuration",
  rl."refRepaymentStartDate",
  rl."refLoanStartDate",
  rl."refLoanDueDate",
  rl."isInterestFirst"
FROM
  public."refLoan" rl
  LEFT JOIN public."refProducts" rp ON CAST(rp."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
WHERE
  "refUserId" = $1;
`;

export const getLoanDataOption = `SELECT
  rl."refLoanId",
  rl."refLoanAmount",
  rp."refProductInterest",
  rp."refProductDuration"
FROM
  public."refLoan" rl
  LEFT JOIN public."refProducts" rp ON CAST(rp."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
WHERE
  rl."refUserId" = $1 AND rl."refLoanStatus" = 1`;

export const updateLoan = `UPDATE
  public."refLoan"
SET
  ("refLoanStatus", "updatedAt", "updatedBy") = ($2, $3, $4)
WHERE
  "refLoanId" = $1
RETURNING
  *;`;

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

export const checkLoanExtension = `SELECT
  TO_CHAR(
    TO_TIMESTAMP($1, 'DD/MM/YYYY, HH:MI:SS PM') AT TIME ZONE 'Asia/Kolkata',
    'MM/YYYY'
  ) = TO_CHAR(rl."refLoanDueDate"::DATE, 'MM/YYYY') AS "check"
FROM
  public."refLoan" rl
WHERE
  rl."refLoanId" = $2;`;

export const getMonthDuration = `SELECT
  rl."refLoanId",
  (
    DATE_PART('year', AGE(
      TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')::timestamp,
      rl."refRepaymentStartDate"::timestamp
    )) * 12 +
    DATE_PART('month', AGE(
      TO_TIMESTAMP($2, 'DD/MM/YYYY, HH12:MI:SS AM')::timestamp,
      rl."refRepaymentStartDate"::timestamp
    ))
  ) + 1 AS "month_diff",
  rp."refProductInterest",rp."refProductDuration",rl."refLoanAmount",rl."refInterestMonthCount"
FROM
  public."refLoan" rl
  LEFT JOIN public."refProducts" rp ON CAST (rp."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
WHERE
  rl."refLoanId" = $1;`;
