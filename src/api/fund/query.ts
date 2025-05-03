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
    "refFundType"
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
      'Self Transfer'
    ),
    (
      $2,
      TO_CHAR(TO_TIMESTAMP($4, 'DD/MM/YYYY, HH12:MI:SS AM'), 'YYYY-MM-DD'),
      'credit',
      $3::TEXT,
      NULL,
      $4,
      $5,
      'Self Transfer'
    );
  `;
