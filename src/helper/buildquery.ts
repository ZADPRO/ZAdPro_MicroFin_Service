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

export { buildUpdateQuery, getChanges };
