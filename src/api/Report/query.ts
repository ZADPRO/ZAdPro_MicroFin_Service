export const rePaymentType = `SELECT * FROM public."refRepaymentType"`;
export const loanStatus = `SELECT * FROM public."refLoanStatus"`;

export const overAllReport = `SELECT
  l."refLoanStartDate",
  l."refCustLoanId",
  u."refUserFname",
  u."refUserLname",
  u."refUserId",
  rc."refUserMobileNo",
  rc."refUserEmail",
  rpt."refRepaymentTypeName",
  l."refInitialInterest",
  l."refInterestMonthCount",
  l."refLoanAmount",
  rp."refProductInterest",
  rp."refProductDuration",
  l."refDocFee",
  l."refSecurity",
  ls."refLoanStatus",
  COUNT(*) FILTER (
    WHERE
      rs."refInterestStatus" = 'paid'
  ) AS "InterestPaidCount",
  COUNT(*) FILTER (
    WHERE
      rs."refPrincipalStatus" = 'paid'
  ) AS "PrincipalPaidCount",
  COUNT(*) FILTER (
    WHERE
      rs."refInterestStatus" = 'paid'
      AND rs."refPrincipalStatus" = 'paid'
  ) AS "TotalMonthPaidCount",
  SUM(
    CASE
      WHEN rs."refInterestStatus" = 'paid' THEN rs."refInterest"::NUMERIC
      ELSE 0
    END
  ) AS "TotalInterestPaid",
  SUM(
    CASE
      WHEN rs."refPrincipalStatus" = 'paid' THEN rs."refPrincipal"::NUMERIC
      ELSE 0
    END
  ) AS "TotalPrincipalPaid",
  (
    rp."refProductDuration"::NUMERIC - COUNT(*) FILTER (
      WHERE
        rs."refInterestStatus" = 'paid'
        AND rs."refPrincipalStatus" = 'paid'
    )
  ) AS "UnPaidMonthCount",
  (
    l."refLoanAmount"::NUMERIC - SUM(
      CASE
        WHEN rs."refPrincipalStatus" = 'paid' THEN rs."refPrincipal"::NUMERIC
        ELSE 0
      END
    )::NUMERIC
  ) AS "BalancePrincipalAmount"
FROM
  public."refLoan" l
  LEFT JOIN public."refLoanStatus" ls ON CAST(ls."refLoanStatusId" AS INTEGER) = l."refLoanStatus"::INTEGER
  LEFT JOIN public."refProducts" rp ON CAST(rp."refProductId" AS INTEGER) = l."refProductId"::INTEGER
  LEFT JOIN public."refRepaymentSchedule" rs ON CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"::INTEGER
  LEFT JOIN public.users u ON CAST(u."refUserId" AS INTEGER) = l."refUserId"::INTEGER
  LEFT JOIN public."refCommunication" rc ON CAST(u."refUserId" AS INTEGER) = rc."refUserId"::INTEGER
  LEFT JOIN public."refRepaymentType" rpt ON CAST(rpt."refRepaymentTypeId" AS INTEGER) = l."refRePaymentType"::INTEGER
WHERE
  l."refRePaymentType"::INTEGER = ANY ($1)
  AND l."refLoanStatus"::INTEGER = ANY ($2)
GROUP BY
  l."refLoanId",
  u."refUserFname",
  u."refUserLname",
  u."refUserId",
  rc."refUserMobileNo",
  rc."refUserEmail",
  rpt."refRepaymentTypeName",
  l."refInitialInterest",
  l."refInterestMonthCount",
  l."refLoanAmount",
  rp."refProductInterest",
  rp."refProductDuration",
  l."refDocFee",
  l."refSecurity",
  l."refLoanStartDate",
  l."refCustLoanId",
  ls."refLoanStatus"
ORDER BY
  l."refLoanId";
  `;

export const overallReportAdminLoan = `SELECT
  l."refLoanStartDate",
  l."refCustLoanId",
  v."refVendorName" AS "refUserFname",
  '' AS "refUserLname",
  v."refVendorId" AS "refUserId",
  v."refVendorMobileNo" AS "refUserMobileNo",
  v."refVendorEmailId" AS "refUserEmail",
  rpt."refRepaymentTypeName",
  l."refInitialInterest",
  l."refInterestMonthCount",
  l."refLoanAmount",
  l."refLoanInterest" AS "refProductInterest",
  l."refLoanDuration" AS "refProductDuration",
  l."refDocFee",
  l."refSecurity",
  ls."refLoanStatus",
  COUNT(*) FILTER (
    WHERE
      rs."refInterestStatus" = 'paid'
  ) AS "InterestPaidCount",
  COUNT(*) FILTER (
    WHERE
      rs."refPrincipalStatus" = 'paid'
  ) AS "PrincipalPaidCount",
  COUNT(*) FILTER (
    WHERE
      rs."refInterestStatus" = 'paid'
      AND rs."refPrincipalStatus" = 'paid'
  ) AS "TotalMonthPaidCount",
  SUM(
    CASE
      WHEN rs."refInterestStatus" = 'paid' THEN rs."refInterest"::NUMERIC
      ELSE 0
    END
  ) AS "TotalInterestPaid",
  SUM(
    CASE
      WHEN rs."refPrincipalStatus" = 'paid' THEN rs."refPrincipal"::NUMERIC
      ELSE 0
    END
  ) AS "TotalPrincipalPaid",
  (
    l."refLoanDuration"::NUMERIC - COUNT(*) FILTER (
      WHERE
        rs."refInterestStatus" = 'paid'
        AND rs."refPrincipalStatus" = 'paid'
    )
  ) AS "UnPaidMonthCount",
  (
    l."refLoanAmount"::NUMERIC - SUM(
      CASE
        WHEN rs."refPrincipalStatus" = 'paid' THEN rs."refPrincipal"::NUMERIC
        ELSE 0
      END
    )::NUMERIC
  ) AS "BalancePrincipalAmount"
FROM
  adminloan."refLoan" l
  LEFT JOIN public."refLoanStatus" ls ON CAST(ls."refLoanStatusId" AS INTEGER) = l."refLoanStatus"::INTEGER
  LEFT JOIN adminloan."refRepaymentSchedule" rs ON CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"::INTEGER
  LEFT JOIN adminloan."refVendorDetails" v ON CAST(v."refVendorId" AS INTEGER) = l."refVenderId"::INTEGER
  LEFT JOIN public."refRepaymentType" rpt ON CAST(rpt."refRepaymentTypeId" AS INTEGER) = l."refRePaymentType"::INTEGER
WHERE
  l."refRePaymentType"::INTEGER = ANY ($1)
  AND l."refLoanStatus"::INTEGER = ANY ($2)
GROUP BY
  l."refLoanId",
  v."refVendorName",
  v."refVendorId",
  v."refVendorMobileNo",
  v."refVendorEmailId",
  rpt."refRepaymentTypeName",
  l."refInitialInterest",
  l."refInterestMonthCount",
  l."refLoanAmount",
  l."refLoanDuration",
  l."refLoanInterest",
  l."refDocFee",
  l."refSecurity",
  l."refLoanStartDate",
  l."refCustLoanId",
  ls."refLoanStatus"
ORDER BY
  l."refLoanId";`;

export const monthlyReportCustomer1 = `SELECT
  l."refLoanStartDate",
  rs."refPaymentDate",
  l."refCustLoanId",
  u."refUserFname",
  u."refUserLname",
  rc."refUserMobileNo",
  rc."refUserEmail",
  rt."refRepaymentTypeName",
  l."refInitialInterest",
  rs."refPrincipal",
  rs."refInterest",
  l."refLoanAmount",
  rs."refPrincipalStatus",
  rs."refInterestStatus"
FROM
  public."refLoan" l
  LEFT JOIN public."refRepaymentSchedule" rs ON CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"::INTEGER
  LEFT JOIN public.users u ON CAST(u."refUserId" AS INTEGER) = l."refUserId"::INTEGER
  LEFT JOIN public."refCommunication" rc ON CAST(rc."refUserId" AS INTEGER) = l."refUserId"::INTEGER
  LEFT JOIN public."refRepaymentType" rt ON CAST(rt."refRepaymentTypeId" AS INTEGER) = l."refRePaymentType"
WHERE
  l."refLoanStatus" = 1
  AND rs."refPrincipalStatus" = ANY ($1)
  AND rs."refInterestStatus" = ANY ($2)
  AND rs."refPaymentDate" BETWEEN $3 AND $4`;

export const monthlyReportCustomer = `SELECT
  l."refLoanStartDate",
  rs."refPaymentDate",
  l."refCustLoanId",
  u."refUserFname",
  u."refUserLname",
  rc."refUserMobileNo",
  rc."refUserEmail",
  rt."refRepaymentTypeName",
  l."refInitialInterest",
  rs."refPrincipal",
  rs."refInterest",
  l."refLoanAmount",
  rs."refPrincipalStatus",
  rs."refInterestStatus"
FROM
  public."refLoan" l
  LEFT JOIN public."refRepaymentSchedule" rs ON CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"::INTEGER
  LEFT JOIN public.users u ON CAST(u."refUserId" AS INTEGER) = l."refUserId"::INTEGER
  LEFT JOIN public."refCommunication" rc ON CAST(rc."refUserId" AS INTEGER) = l."refUserId"::INTEGER
  LEFT JOIN public."refRepaymentType" rt ON CAST(rt."refRepaymentTypeId" AS INTEGER) = l."refRePaymentType"
WHERE
  l."refLoanStatus" = 1
  AND rs."refPrincipalStatus" = ANY ($1)
  AND rs."refInterestStatus" = ANY ($2)
  AND TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY') >= TO_DATE($3 || '-01', 'YYYY-MM-DD')
  AND TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY') < (TO_DATE($4 || '-01', 'YYYY-MM-DD') + INTERVAL '1 month')
`;
export const monthlyReportAdminLoan = `SELECT
  l."refLoanStartDate",
  rs."refPaymentDate",
  l."refCustLoanId",
  v."refVendorName" AS "refUserFname",
  v."refVendorMobileNo" AS "refUserMobileNo",
  v."refVendorEmailId" AS "refUserEmail",
  rt."refRepaymentTypeName",
  l."refInitialInterest",
  rs."refPrincipal",
  rs."refInterest",
  l."refLoanAmount",
  rs."refPrincipalStatus",
  rs."refInterestStatus"
FROM
  adminloan."refLoan" l
  LEFT JOIN adminloan."refRepaymentSchedule" rs ON CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"::INTEGER
  LEFT JOIN adminloan."refVendorDetails" v ON CAST(v."refVendorId" AS INTEGER) = l."refVenderId"::INTEGER
  LEFT JOIN public."refRepaymentType" rt ON CAST(rt."refRepaymentTypeId" AS INTEGER) = l."refRePaymentType"
WHERE
  l."refLoanStatus" = 1
  AND rs."refPrincipalStatus" = ANY ($1)
  AND rs."refInterestStatus" = ANY ($2)
  AND TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY') >= TO_DATE($3 || '-01', 'YYYY-MM-DD')
  AND TO_DATE(rs."refPaymentDate", 'DD-MM-YYYY') < (TO_DATE($4 || '-01', 'YYYY-MM-DD') + INTERVAL '1 month')`;
export const expenseData = `SELECT
  re."refExpenseDate",
  re."refVoucherNo",
  ec."refExpenseCategory",
  re."refSubCategory",
  re."refAmount",
  ba."refBankName",
  bat."refAccountTypeName",
  re."refExpenseId",
  re."refCategoryId",
  re."refBankId"
FROM
  adminloan."refExpense" re
  LEFT JOIN adminloan."refExpenseCategory" ec ON CAST(re."refCategoryId" AS INTEGER) = ec."refExpenseCategoryId"
  LEFT JOIN public."refBankAccounts" ba ON CAST(re."refBankId" AS INTEGER) = ba."refBankId"
  LEFT JOIN public."refBankAccountType" bat ON CAST(bat."refAccountId" AS INTEGER) = ba."refAccountType"
  WHERE TO_CHAR(re."refExpenseDate"::timestamp, 'YYYY-MM') = $1
  ORDER BY re."refExpenseDate" DESC;`;
