const buildUpdateQuery = (tableName: string, data: any, identifier: any) => {
  const columns = [];
  const values = [];
  let index = 1;

  // Iterate over the data object and build the query dynamically
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      columns.push(`"${key}" = $${index}`);
      values.push(data[key]);
      index++;
    }
  }

  // Add the condition (e.g., WHERE "refStId" = $index)
  const condition = `"${identifier.column}" = $${index}`;
  values.push(identifier.value); // Push the identifier value for the condition

  const updateQuery = `
        UPDATE public."${tableName}"
        SET ${columns.join(", ")}
        WHERE ${condition}
        RETURNING *;
      `;
  return { updateQuery, values };
};

type Change = {
  oldValue: any;
  newValue: any;
};

const getChanges = (
  updatedData: any,
  oldData: any
): { [key: string]: Change } => {
  const changes: { [key: string]: Change } = {};
  for (const key in updatedData) {
    if (updatedData.hasOwnProperty(key)) {
      if (updatedData[key] !== oldData[key]) {
        changes[key] = {
          oldValue: oldData[key],
          newValue: updatedData[key],
        };
      }
    }
  }

  return changes;
};

async function buildBulkInsertQuery(
  schema: string,
  table: string,
  columns: string[],
  dataArray: any[]
): Promise<{ query: string; values: any; truncateQuery: string }> {
  const tableFullName = `"${schema}"."${table}"`;
  const columnList = columns.map((col) => `"${col}"`).join(", ");

  let placeholderIndex = 1;
  const valuesPlaceholders = dataArray
    .map(() => {
      const rowPlaceholders = columns.map(() => `$${placeholderIndex++}`);
      return `(${rowPlaceholders.join(", ")})`;
    })
    .join(", ");

  const values = dataArray.flatMap((row: any) =>
    columns.map((col) => row[col])
  );

  const insertQuery = `INSERT INTO ${tableFullName} (${columnList}) VALUES ${valuesPlaceholders}`;
  const truncateQuery = `TRUNCATE TABLE ${tableFullName};`;

  //   const finalQuery = truncateBeforeInsert
  //     ? `${truncateQuery} ${insertQuery}`
  //     : insertQuery;

  return { query: insertQuery, values, truncateQuery: truncateQuery };
}

export { buildUpdateQuery, getChanges, buildBulkInsertQuery };
