export interface balanceCondationCheck {
  startOfMonth: string;
  previousDate: string;
  currentDate: string;
  isSameDate: boolean;
  isSameMonth: boolean;
  endDate: string;
  inputDate: string;
  previousMonthStart: string;
  previousMonthEnd: string;
}

export async function getMonthDatesWithInfo(
    isoDateStr: string,
     endDateStr: string,
  currentDateStr: string,
 
): Promise<balanceCondationCheck> {
    console.log('endDateStr', endDateStr)
  const formatDate = (date: Date): string => {
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date passed to formatDate");
    }
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Parse inputDate (from isoDateStr)
  const inputDate = new Date(isoDateStr);
  if (isNaN(inputDate.getTime())) {
    throw new Error("Invalid isoDateStr: " + isoDateStr);
  }

  // Parse endDate
  const endDate = new Date(endDateStr);
  console.log('endDate', endDate)
  if (isNaN(endDate.getTime())) {
    throw new Error("Invalid endDateStr: " + endDateStr);
  }

  // Parse currentDateStr (can be dd/mm/yyyy or ISO)
  let currentDate: Date;
  if (currentDateStr.includes("/")) {
    const [datePart, timePart = "00:00:00 AM"] = currentDateStr
      .split(",")
      .map((part) => part.trim());
    const [day, month, year] = datePart.split("/").map(Number);
    if (!day || !month || !year) {
      throw new Error("Invalid currentDateStr format: " + currentDateStr);
    }
    currentDate = new Date(`${year}-${month}-${day} ${timePart}`);
  } else {
    currentDate = new Date(currentDateStr);
  }

  if (isNaN(currentDate.getTime())) {
    throw new Error("Invalid currentDate: " + currentDateStr);
  }

  // Start of month based on inputDate
  const startOfMonth = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    1
  );

  // Check if inputDate is first day of the month
  const isSameDate =
    inputDate.getFullYear() === startOfMonth.getFullYear() &&
    inputDate.getMonth() === startOfMonth.getMonth() &&
    inputDate.getDate() === startOfMonth.getDate();

  // Check if inputDate is in same month as currentDate
  const isSameMonth =
    inputDate.getFullYear() === currentDate.getFullYear() &&
    inputDate.getMonth() === currentDate.getMonth();

  // Previous day of inputDate
  const previousDate = new Date(inputDate);
  previousDate.setDate(previousDate.getDate() - 1);

  // Previous month range based on inputDate
  const previousMonthStart = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth() - 1,
    1
  );
  const previousMonthEnd = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    0
  );

  return {
    startOfMonth: formatDate(startOfMonth),
    previousDate: formatDate(previousDate),
    currentDate: formatDate(currentDate),
    isSameDate,
    isSameMonth,
    endDate: formatDate(endDate),
    inputDate: formatDate(inputDate),
    previousMonthStart: formatDate(previousMonthStart),
    previousMonthEnd: formatDate(previousMonthEnd),
  };
}