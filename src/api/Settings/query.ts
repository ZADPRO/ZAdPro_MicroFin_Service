export const getCustomerIdTypeOption = `SELECT * FROM settings."refCustomerIdType"`;
export const getLoanIdTypeOption = `SELECT * FROM settings."refLoanIdType"`;
export const getSeetings = `SELECT * FROM settings."refSettings"`;
export const updateSettings = `UPDATE
  settings."refSettings"
SET
  "refSettingValue" = $2
WHERE
  "refSettingId" = $1`;
