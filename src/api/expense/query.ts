export const newExpense = `INSERT INTO adminloan."refExpense" (
  "refExpenseDate",
  "refVoucherNo",
  "refCategoryId",
  "refSubCategory",
  "refAmount",
  "refBankId",
  "refCreateAt",
  "refCreatedBy"
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;
`;

export const addCategory = `INSERT INTO
  adminloan."refExpenseCategory" ("refExpenseCategory")
VALUES
  ($1)
RETURNING
  *;`;

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

export const expenseCatageory = `SELECT
  ec."refExpenseCategoryId",
  ec."refExpenseCategory"
FROM
  adminloan."refExpenseCategory" ec`;

export const getBank = `SELECT
  b."refBankId",
  b."refBankName",
  b."refBankAccountNo",
  b."refBalance",
  b."refAccountType"
FROM
  public."refBankAccounts" b`;

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

export const updateBankAccountDebitQuery = `
UPDATE public."refBankAccounts" 
SET 
  "refBalance" = ("refBalance"::numeric - $1),
  "updatedAt" = $3, 
  "updatedBy" = $4
WHERE "refBankId" = $2
RETURNING "refBalance";
`;

export const updateBankAccountCreditQuery = `
UPDATE public."refBankAccounts" 
SET 
  "refBalance" = ("refBalance"::numeric + $1),
  "updatedAt" = $3, 
  "updatedBy" = $4
WHERE "refBankId" = $2
RETURNING "refBalance";
`;

export const getExpenseData = `SELECT * FROM adminloan."refExpense" re
WHERE re."refExpenseId"=$1`;

export const getExpenseHistoreyData = `SELECT
  *
FROM
  adminloan."refExpense" re
LEFT JOIN public."refBankFund" bf ON CAST (bf."refTxnId" AS INTEGER) = re."refExpenseId"
WHERE
  re."refExpenseId" = $1 AND bf."refFundTypeId" = 7`;

export const updateExpense = `UPDATE
  adminloan."refExpense"
SET
  "refExpenseDate" = $1,
  "refVoucherNo" = $2,
  "refCategoryId" = $3,
  "refSubCategory" = $4,
  "refAmount" = $5,
  "refBankId" = $6,
  "refupdateAt" = $7,
  "refUpdateBy" = $8
WHERE
  "refExpenseId" = $9
RETURNING
  *;`;

export const updateFund = `UPDATE public."refBankFund"
SET
  "refBankId" = $1,
  "refbfTransactionDate" = $2,
  "refbfTrasactionType" = $3,
  "refbfTransactionAmount" = $4,
  "refTxnId" = $5,
  "refFundType" = $6,
  "refFundTypeId" = $7,
  "updatedAt" = $8,
  "updatedBy" = $9
WHERE
  "refBankFId" = $10;
`;
