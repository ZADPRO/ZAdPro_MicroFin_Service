export const getLastMonthBalance = `SELECT
  *
FROM
  public."refOpenCloseBal" ob
WHERE
  TO_DATE(ob."refFromDate", 'YYYY-MM-DD') = TO_DATE($1, 'YYYY-MM-DD')
  AND TO_DATE(ob."refToDate", 'YYYY-MM-DD') = TO_DATE($2, 'YYYY-MM-DD')`;

  export const calculateBalance = `SELECT
  ROUND(
    COALESCE(
      SUM(
        CAST(
          NULLIF(bf."refbfTransactionAmount", 'null') AS NUMERIC
        )
      ),
      0
    )::NUMERIC
  ) AS "Balance",
  ft."refFundTypeId",
  ft."refFundTypeName"
FROM
  public."refFundType" ft
  LEFT JOIN public."refBankFund" bf 
    ON CAST(bf."refFundTypeId" AS INTEGER) = ft."refFundTypeId"
    AND TO_DATE(bf."refbfTransactionDate", 'YYYY-MM-DD') BETWEEN TO_DATE($1, 'YYYY-MM-DD') AND TO_DATE($2, 'YYYY-MM-DD')
GROUP BY
  ft."refFundTypeId", ft."refFundTypeName"`;