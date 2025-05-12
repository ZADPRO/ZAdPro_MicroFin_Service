export const addVendor = `WITH inserted_vendor AS (
  INSERT INTO adminloan."refVendorDetails" (
    "refVendorName",
    "refVendorMobileNo",
    "refVendorEmailId",
    "refVenderType",
    "refAddress",
    "refDescription",
    "refCreateAt",
    "refCreateBy"
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING "refVendorId"
)
INSERT INTO adminloan."refVendorBank" (
  "refBankName",
  "refVendorId",
  "refAccountNo",
  "refIFSCCode",
  "refUPICode"
)
SELECT 
  bank."refBankName",
  v."refVendorId",
  bank."refAccountNo",
  bank."refIFSCCode",
  bank."refUPICode"
FROM 
  jsonb_to_recordset($9::jsonb) AS bank(
    "refBankName" TEXT,
    "refAccountNo" TEXT,
    "refIFSCCode" TEXT,
    "refUPICode" TEXT
  ),
  inserted_vendor v;
`;

export const updateVendor = `WITH updated_vendor AS (
  UPDATE adminloan."refVendorDetails"
  SET
    "refVendorName" = $2,
    "refVendorMobileNo" = $3,
    "refVendorEmailId" = $4,
    "refVenderType" = $5,
    "refAddress" = $6,
    "refDescription" = $7,
    "refUpdateAt" = $8,
    "refUpdateBy" = $9
  WHERE "refVendorId" = $1
  RETURNING "refVendorId"
),
-- UPSERT existing banks (where refBankId is present)
upsert_existing AS (
  INSERT INTO adminloan."refVendorBank" (
    "refBankId",
    "refBankName",
    "refVendorId",
    "refAccountNo",
    "refIFSCCode",
    "refUPICode"
  )
  SELECT 
    bank."refBankId",
    bank."refBankName",
    v."refVendorId",
    bank."refAccountNo",
    bank."refIFSCCode",
    bank."refUPICode"
  FROM 
    jsonb_to_recordset($10::jsonb) AS bank(
      "refBankId" INT,
      "refBankName" TEXT,
      "refAccountNo" TEXT,
      "refIFSCCode" TEXT,
      "refUPICode" TEXT
    ),
    updated_vendor v
  WHERE bank."refBankId" IS NOT NULL
  ON CONFLICT ("refBankId") DO UPDATE
  SET
    "refBankName" = EXCLUDED."refBankName",
    "refAccountNo" = EXCLUDED."refAccountNo",
    "refIFSCCode" = EXCLUDED."refIFSCCode",
    "refUPICode" = EXCLUDED."refUPICode",
    "refVendorId" = EXCLUDED."refVendorId"
)
-- INSERT new banks (where refBankId is null)
INSERT INTO adminloan."refVendorBank" (
  "refBankName",
  "refVendorId",
  "refAccountNo",
  "refIFSCCode",
  "refUPICode"
)
SELECT 
  bank."refBankName",
  v."refVendorId",
  bank."refAccountNo",
  bank."refIFSCCode",
  bank."refUPICode"
FROM 
  jsonb_to_recordset($10::jsonb) AS bank(
    "refBankId" INT,
    "refBankName" TEXT,
    "refAccountNo" TEXT,
    "refIFSCCode" TEXT,
    "refUPICode" TEXT
  ),
  updated_vendor v
WHERE bank."refBankId" IS NULL;

`;

export const vendorList = `SELECT
  vd."refVendorId",
  vd."refVendorName",
  vd."refVendorMobileNo",
  vd."refVenderType",
  vd."refVendorEmailId",
  vd."refDescription"
FROM
  adminloan."refVendorDetails" vd`;

export const vendorDetails = `SELECT jsonb_build_object(
    'vendorName', vd."refVendorName",
    'mobileNo', vd."refVendorMobileNo",
    'emailId', vd."refVendorEmailId",
    'vendorType', vd."refVenderType",
    'address', vd."refAddress",
    'description', vd."refDescription",
    'vendorId', vd."refVendorId",
    'vendorBank', COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'refBankId', vb."refBankId",
          'refBankName', vb."refBankName",
          'refAccountNo', vb."refAccountNo",
          'refIFSCCode', vb."refIFSCCode",
          'refUPICode', vb."refUPICode"
        )
      ) FILTER (WHERE vb."refBankId" IS NOT NULL),
      '[]'::jsonb
    )
  ) AS vendorData
  FROM adminloan."refVendorDetails" vd
  LEFT JOIN adminloan."refVendorBank" vb ON vd."refVendorId" = vb."refVendorId"
  WHERE vd."refVendorId" = $1
  GROUP BY vd."refVendorId";`;

