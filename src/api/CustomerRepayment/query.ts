export const nameQuery = `SELECT "refUserFname" , "refUserLname" FROM public."users" WHERE "refUserId" = $1
`;
export const userList = `SELECT
  CASE
    WHEN (
      SELECT
        s."refSettingValue"
      FROM
        settings."refSettings" s
      WHERE
        s."refSettingId" = 1
    ) = 2 THEN ra."refAreaPrefix" || (u."refUserId"::NUMERIC + 10000)::text
    ELSE (u."refUserId"::NUMERIC + 10000)::text
  END AS "refCustId",
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
  rpr."refProductDurationType",
  rpr."refProductMonthlyCal",
  rl."refLoanAmount",
  rl."refLoanId"
FROM
  public."refRepaymentSchedule" rp
  INNER JOIN public."refLoan" rl ON CAST(rl."refLoanId" AS INTEGER) = rp."refLoanId"::integer
  INNER JOIN public.users u ON CAST(u."refUserId" AS INTEGER) = rl."refUserId"
  INNER JOIN public."refProducts" rpr ON CAST(rpr."refProductId" AS INTEGER) = rl."refProductId"::INTEGER
  INNER JOIN public."refCommunication" rc ON CAST(rc."refUserId" AS INTEGER) = u."refUserId"
  LEFT JOIN public."refAreaPincode" ap ON CAST(ap."refAreaPinCode" AS TEXT) = rc."refUserPincode"::TEXT
  LEFT JOIN public."refArea" ra ON CAST(ra."refAreaId" AS INTEGER) = ap."refAreaId"
WHERE
  (
    rp."refPrincipalStatus" = 'Pending'
    OR rp."refInterestStatus" = 'Pending'
  )
  AND rl."refLoanStatus" = 1
  AND (
    (
      $1 = false
      AND TO_DATE(rp."refPaymentDate", 'DD-MM-YYYY') <= TO_DATE($2, 'DD-MM-YYYY')
    )
    OR (
      $1 = true
      AND TO_DATE(rp."refPaymentDate", 'DD-MM-YYYY') BETWEEN TO_DATE($2, 'DD-MM-YYYY') AND TO_DATE($3, 'DD-MM-YYYY')
    )
  )
ORDER BY
  TO_DATE(rp."refPaymentDate", 'DD-MM-YYYY') ASC;`;

export const LoanDetails = `SELECT
  rs."refPaymentDate",
  l."refLoanId",
  l."isInterestFirst",
  l."refLoanAmount",
  l."refLoanStartDate",
  l."refRepaymentStartDate",
  l."refLoanDueDate",
  l."refInitialInterest",
  l."refInterestMonthCount",
  rp."refProductDurationType",
  rp."refProductMonthlyCal",
  rp."refProductName",
  rp."refProductInterest",
  rt."refRepaymentTypeName",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(CAST(rp2."refPrincipal" AS NUMERIC))
        FROM
          public."refRepaymentSchedule" rp2
        WHERE
          CAST(rp2."refLoanId" AS INTEGER) = l."refLoanId"
          AND rp2."refPrincipalStatus" = 'paid'
      ),
      0
    )::NUMERIC
  ) AS "totalPrincipal",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(CAST(rp2."refInterest" AS NUMERIC))
        FROM
          public."refRepaymentSchedule" rp2
        WHERE
          CAST(rp2."refLoanId" AS INTEGER) = l."refLoanId"
          AND rp2."refInterestStatus" = 'paid'
      ),
      0
    )::NUMERIC
  ) AS "totalInterest",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(CAST(la."refAmount" AS NUMERIC))
        FROM
          public."refLoanAdvance" la
        WHERE
          la."refLoanId" = l."refLoanId"
      ),
      0
    )::NUMERIC
  ) AS "loanAdvance",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(
            (
              (
                rp2."refPrincipal"::NUMERIC + rp2."refInterest"::NUMERIC
              ) - rp2."refArears"::NUMERIC
            ) - (
              CASE
                WHEN (
                  (
                    rp2."refPrincipal"::NUMERIC + rp2."refInterest"::NUMERIC
                  ) - rp2."refArears"::NUMERIC
                ) > rp2."refInterest"::NUMERIC THEN rp2."refInterest"::NUMERIC
                ELSE (
                  (
                    rp2."refPrincipal"::NUMERIC + rp2."refInterest"::NUMERIC
                  ) - rp2."refArears"::NUMERIC
                )
              END
            )
          )
        FROM
          public."refRepaymentSchedule" rp2
        WHERE
          CAST(rp2."refLoanId" AS INTEGER) = l."refLoanId"
          AND rp2."refArears" IS NOT NULL
          AND rp2."refArears"::NUMERIC <> 0
      ),
      0
    )::NUMERIC
  ) AS "totalPrincipalInArears",
  COALESCE(
    (
      SELECT
        SUM(
          CASE
            WHEN (
              (
                rp2."refPrincipal"::NUMERIC + rp2."refInterest"::NUMERIC
              ) - rp2."refArears"::NUMERIC
            ) > rp2."refInterest"::NUMERIC THEN 0
            ELSE (
              (
                rp2."refPrincipal"::NUMERIC + rp2."refInterest"::NUMERIC
              ) - rp2."refArears"::NUMERIC
            )
          END
        )
      FROM
        public."refRepaymentSchedule" rp2
      WHERE
        CAST(rp2."refLoanId" AS INTEGER) = l."refLoanId"
        AND rp2."refArears" IS NOT NULL
        AND rp2."refArears"::NUMERIC <> 0
    ),
    0
  )::NUMERIC AS "totalInterestPaidInAreas"
FROM
  public."refLoan" l
  LEFT JOIN public."refRepaymentSchedule" rs ON CAST(rs."refLoanId" AS INTEGER) = l."refLoanId"
  LEFT JOIN public."refProducts" rp ON CAST(rp."refProductId" AS INTEGER) = l."refProductId"::INTEGER
  LEFT JOIN public."refRepaymentType" rt ON CAST(rt."refRepaymentTypeId" AS INTEGER) = l."refRePaymentType"::INTEGER
WHERE
  l."refLoanId" = $1
  AND rs."refRpayId" = $2
GROUP BY
  l."refLoanId",
  rp."refProductDurationType",
  rp."refProductMonthlyCal",
  rp."refProductName",
  rp."refProductInterest",
  rt."refRepaymentTypeName",
  rp."refProductDuration",
  rs."refPaymentDate"`;

export const rePaymentData = `SELECT
  rs."refPaymentDate",
  rs."refLoanId",
  rs."refRpayId",
  rs."refPrincipal",
  rs."refInterest",
  rs."refPrincipalStatus",
  rs."refInterestStatus",
  COALESCE(
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'rerLoanPayId', lp."rerLoanPayId",
        'refPaymentDate', lp."refPaymentDate",
        'refCash', lp."refCash",
        'refOnline', lp."refOnline",
        'refTotal', lp."refTotal",
        'refApprove', lp."refApprove"
      )
    ) FILTER (
      WHERE lp."refRpayId" IS NOT NULL
    ),
    '[]'
  ) AS "loanPayments",
  ROUND(
    COALESCE(
      (
        SELECT
          SUM(CAST(lp."refTotal" AS NUMERIC))
        FROM
          public."refLoanPayment" lp
        WHERE
          CAST(lp."refRpayId" AS INTEGER) = rs."refRpayId"
      ),
      0
    )::NUMERIC
  ) AS "totalPaid"
  
FROM
  public."refRepaymentSchedule" rs
LEFT JOIN
  public."refLoanPayment" lp
  ON lp."refRpayId" = rs."refRpayId"
WHERE
  rs."refRpayId" = $1
GROUP BY
  rs."refPaymentDate",
  rs."refLoanId",
  rs."refRpayId",
  rs."refPrincipal",
  rs."refInterest",
  rs."refPrincipalStatus",
  rs."refInterestStatus";`;
