export const getCustomerIdTypeOption = `SELECT * FROM settings."refCustomerIdType"`;
export const getLoanIdTypeOption = `SELECT * FROM settings."refLoanIdType"`;
export const getLoanClosingCal = `SELECT * FROM settings."refLoanClosingCal"`;
export const getSeetings = `SELECT * FROM settings."refSettings"`;
export const updateSettings1 = `UPDATE
  settings."refSettings"
SET
  "refSettingValue" = $2
WHERE
  "refSettingId" = $1`;
export const updateSettings = `WITH updates AS (
  SELECT *
  FROM json_to_recordset($1) AS x(
    id INT,
    "refSettingValue" INT,
    "refSettingBoolean" BOOLEAN,
    "refSettingData" TEXT[]
  )
)
UPDATE settings."refSettings" s
SET 
  "refSettingValue" = COALESCE(u."refSettingValue", s."refSettingValue"),
  "refSettingBoolean" = COALESCE(u."refSettingBoolean", s."refSettingBoolean"),
  "refSettingData" = COALESCE(array_to_string(u."refSettingData", ','), s."refSettingData")
FROM updates u
WHERE s."refSettingId" = u.id;`;

export const getLoanType = `SELECT * FROM "settings"."refLoanType"`;
export const getRepaymentType = `SELECT * FROM "settings"."refRepaymentType"`;
export const updateLoanType = `UPDATE
  public."refLoanType"
SET
  "refVisible" = CASE
    WHEN "refLoanTypeId" = ANY ($1) THEN true
    ELSE false
  END;`;
export const updateRePaymentType = `UPDATE
  public."refRepaymentType"
SET
  "refVisible" = CASE
    WHEN "refRepaymentTypeId" = ANY ($1) THEN true
    ELSE false
  END;`;
export const getLoanTypeVisible = `SELECT
  "refLoanTypeId"
FROM
  public."refLoanType"
where
  "refVisible" = true;`;
export const getRePaymentTypeVisible = `SELECT
  "refRepaymentTypeId"
FROM
  public."refRepaymentType"
where
  "refVisible" = true;`;

export const getLoanAdvanceCalOption = `SELECT
  *
FROM
  settings."refLoanAdvanceCal"
ORDER BY
  "refLoanAdvanceCalId"`;