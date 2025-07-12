export const addFund = `UPDATE
  public."refBankAccounts"
SET
  "refBalance" = CASE
    WHEN "refBankId" = $1 THEN (
      CAST(
        COALESCE(NULLIF("refBalance", ''), '0') AS NUMERIC
      ) - $3
    )::TEXT
    WHEN "refBankId" = $2 THEN (
      CAST(
        COALESCE(NULLIF("refBalance", ''), '0') AS NUMERIC
      ) + $3
    )::TEXT
    ELSE "refBalance"
  END,
  "updatedAt" = $4, -- Update refUpdatedAt with $4
  "updatedBy" = $5 -- Update refUpdatedBy with $5
WHERE
  "refBankId" IN ($1, $2);
`;

export const updateFund = `INSERT INTO public."refBankFund" (
    "refBankId",
    "refbfTransactionDate",
    "refbfTrasactionType",
    "refbfTransactionAmount",
    "refTxnId",
    "createdAt",
    "createdBy",
    "refFundType",
    "refFundTypeId"
  )
  VALUES
    (
      $1,
      TO_CHAR(TO_TIMESTAMP($4, 'DD/MM/YYYY, HH12:MI:SS AM'), 'YYYY-MM-DD'),
      'debit',
      $3::TEXT,
      NULL,
      $4,
      $5,
      $6,
      $7
    ),
    (
      $2,
      TO_CHAR(TO_TIMESTAMP($4, 'DD/MM/YYYY, HH12:MI:SS AM'), 'YYYY-MM-DD'),
      'credit',
      $3::TEXT,
      NULL,
      $4,
      $5,
      $6,
      $7
    );
  `;

export const addedFundList = `SELECT
  bf."refBankFId",
  bf."refBankId",
  bf."refbfTransactionDate",
  bf."refbfTransactionAmount",
  bf."createdAt",
  ba."refBankName",
  bf."refFundType",
  NOT EXISTS (
    SELECT
      1
    FROM
      public."refBankFund" bf2
    WHERE
      bf2."refBankId" = bf."refBankId"
      AND bf2."refBankFId" > bf."refBankFId"
  ) AS "condation"
FROM
  public."refBankFund" bf
  LEFT JOIN public."refBankAccounts" ba ON CAST(ba."refBankId" AS INTEGER) = bf."refBankId"
WHERE
  bf."refFundTypeId" = 5
  AND TO_DATE(bf."refbfTransactionDate", 'YYYY-MM') = TO_DATE($1, 'YYYY-MM')
ORDER BY
  TO_DATE(bf."refbfTransactionDate", 'YYYY-MM-DD') ASC;`;

export const updateFundData = `UPDATE
  public."refBankFund"
SET
  "refFundType" = $1,
  "refbfTransactionAmount" = $2
WHERE
  "refBankFId" = $3`;

export const updateBankBalance = `UPDATE public."refBankAccounts"
SET "refBalance" = 
  CASE 
    WHEN $3 = 1 THEN "refBalance"::NUMERIC + $1::NUMERIC  
    WHEN $3 = 2 THEN "refBalance"::NUMERIC - $1::NUMERIC  
    ELSE "refBalance"::NUMERIC                 
  END
WHERE "refBankId" = $2;
`;

export const getOldFund = `SELECT
  *
FROM
  public."refBankFund" bf
WHERE
  bf."refBankFId" = $1`;