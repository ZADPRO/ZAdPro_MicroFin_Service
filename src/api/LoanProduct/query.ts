export const getLoanTypeList = `SELECT
  *
FROM
  public."refLoanType"
WHERE
  "refVisible" = true`;
export const getRePaymentTypeList = `SELECT * FROM public."refRepaymentType" WHERE "refVisible" = true`;

export const addNewProduct = `INSERT INTO public."refLoanProducts" (
  "refProductName",
  "refProductInterest",
  "refRePaymentType",
  "refLoanDueType",
  "refProductDuration",
  "refInterestCalType",
  "refStatus",
  "refProductDescurption"
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
);
`;
export const updateProduct = `UPDATE public."refLoanProducts" SET
  "refProductName" = $1,
  "refProductInterest" = $2,
  "refRePaymentType" = $3,
  "refLoanDueType" = $4,
  "refProductDuration" = $5,
  "refInterestCalType" = $6,
  "refStatus" = $7,
  "refProductDescurption" = $8
WHERE
  "refProductId" = $9;
`;

export const getAllProduct = `SELECT
  lp.*,
  rt."refRepaymentTypeName"
FROM
  public."refLoanProducts" lp
  LEFT JOIN public."refRepaymentType" rt ON CAST (rt."refRepaymentTypeId" AS INTEGER) = lp."refRePaymentType"`;
export const nameQuery = `SELECT "refUserFname" , "refUserLname" FROM public."users" WHERE "refUserId" = $1
`;
