export const addNewArea = `WITH addarea AS (
  INSERT INTO public."refArea" ("refAreaName", "refAreaPrefix")
  VALUES ($1, $2)
  RETURNING "refAreaId"
)
INSERT INTO public."refAreaPincode" ("refAreaId", "refAreaPinCode")
SELECT
  a."refAreaId",
  pincode
FROM
  addarea a,
  unnest($3::text[]) AS pincode;`;

export const valPinCode = `SELECT
  *
FROM
  public."refAreaPincode" ap
  LEFT JOIN public."refArea" ra ON CAST (ra."refAreaId" AS INTEGER) = ap."refAreaId"::INTEGER
  WHERE ap."refAreaPinCode" = $1`;

export const listArea = `SELECT
  ra."refAreaId",
  ra."refAreaName",
  ra."refAreaPrefix",
  ap."refAreaPinCodeId",
  ap."refAreaPinCode",
  COUNT(CASE WHEN ap."refAreaPinCode"::TEXT = rc."refUserPincode"::TEXT THEN 1 END) AS "customerCount"
FROM
  public."refArea" ra
  LEFT JOIN public."refAreaPincode" ap ON CAST(ap."refAreaId" AS INTEGER) = ra."refAreaId"
  LEFT JOIN public."refCommunication" rc ON CAST(rc."refUserPincode" AS TEXT) = ap."refAreaPinCode"::TEXT
GROUP BY
  ra."refAreaId",
  ra."refAreaName",
  ra."refAreaPrefix",
  ap."refAreaPinCodeId",
  ap."refAreaPinCode"
ORDER BY
  ra."refAreaId",
  ap."refAreaPinCodeId";`;

export const movePincode = `UPDATE
  public."refAreaPincode"
SET
  "refAreaId" = $1
WHERE
  "refAreaPinCodeId" = $2;`;

export const updateArea = `WITH updateArea AS (
  UPDATE public."refArea"
  SET
    "refAreaName" = $2,
    "refAreaPrefix" = $3
  WHERE "refAreaId" = $1
),
input_data AS (
  SELECT * FROM jsonb_to_recordset($4::jsonb)
  AS x("pinCode" text, "refAreaPinCodeId" int)
),
update_existing AS (
  UPDATE public."refAreaPincode" ap
  SET
    "refAreaId" = $1,
    "refAreaPinCode" = input_data."pinCode"
  FROM input_data
  WHERE
    input_data."refAreaPinCodeId" IS NOT NULL
    AND ap."refAreaPinCodeId" = input_data."refAreaPinCodeId"
)
INSERT INTO public."refAreaPincode" ("refAreaId", "refAreaPinCode")
SELECT $1, input_data."pinCode"
FROM input_data
WHERE input_data."refAreaPinCodeId" IS NULL;`;

export const createNewAreaFromOld = `WITH
  newArea AS (
    INSERT INTO public."refArea" ("refAreaName", "refAreaPrefix")
    VALUES ($1, $2)
    RETURNING "refAreaId"
  ),
  input_data AS (
    SELECT
      x."pinCode",
      x."refAreaPinCodeId",
      na."refAreaId" AS "areaId"
    FROM
      jsonb_to_recordset($3::jsonb) AS x ("pinCode" text, "refAreaPinCodeId" int),
      newArea na
  ),
  update_existing AS (
    UPDATE public."refAreaPincode" ap
    SET
      "refAreaId" = input_data."areaId",
      "refAreaPinCode" = input_data."pinCode"
    FROM
      input_data
    WHERE
      input_data."refAreaPinCodeId" IS NOT NULL
      AND ap."refAreaPinCodeId" = input_data."refAreaPinCodeId"
  )
INSERT INTO public."refAreaPincode" ("refAreaId", "refAreaPinCode")
SELECT
  input_data."areaId",
  input_data."pinCode"
FROM
  input_data
WHERE
  input_data."refAreaPinCodeId" IS NULL;`;

export const validatePinCode = `SELECT
  ra."refAreaName",
  ra."refAreaPrefix"
FROM
  public."refAreaPincode" ap
  LEFT JOIN public."refArea" ra ON CAST(ra."refAreaId" AS INTEGER) = ap."refAreaId"
WHERE
  ap."refAreaPinCode"::TEXT = $1::TEXT`;

export const listAreaPrefix = `SELECT * FROM public."refArea"`;

