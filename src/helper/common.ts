import path from "path";
import * as fs from "fs";

export const getAdjustedTime = (): string => {
  const serverTime = new Date();
  serverTime.setMinutes(serverTime.getMinutes() + 330);

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };

  return new Intl.DateTimeFormat("en-IN", options).format(serverTime);
};

export const CurrentTime = (): string => {
  const systemTime = new Date();

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };
  // return "04/04/2025, 10:00:30 am";
  return new Intl.DateTimeFormat("en-IN", options).format(systemTime);
};

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata", // Change if needed
  };

  return date.toLocaleString("en-IN", options);
}

export function formatToYearMonth(inputDate: string): string {
  const [datePart, timePart, period] = inputDate.split(/[, ]+/); // split by comma and space
  const [day, month, year] = datePart.split("/").map(Number);
  let [hours, minutes, seconds] = timePart.split(":").map(Number);

  if (period.toLowerCase() === "pm" && hours < 12) {
    hours += 12;
  } else if (period.toLowerCase() === "am" && hours === 12) {
    hours = 0;
  }

  const date = new Date(year, month - 1, day, hours, minutes, seconds);
  const formattedYear = date.getFullYear();
  const formattedMonth = String(date.getMonth() + 1).padStart(2, "0");

  return `${formattedYear}-${formattedMonth}`;
}

export function formatYearMonthDate(dateStr: string): string {
  // Parse DD/MM/YYYY, hh:mm:ss AM/PM
  const [datePart, timePart] = dateStr.split(",");
  const [day, month, year] = datePart.trim().split("/").map(Number);

  const formattedDate = new Date(`${year}-${month}-${day} ${timePart.trim()}`);

  const yyyy = formattedDate.getFullYear();
  const mm = String(formattedDate.getMonth() + 1).padStart(2, "0");
  const dd = String(formattedDate.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateMonthYear(dateStr: string): string {
  // Parse DD/MM/YYYY, hh:mm:ss AM/PM
  const [datePart, timePart] = dateStr.split(",");
  const [day, month, year] = datePart.trim().split("/").map(Number);

  const formattedDate = new Date(`${year}-${month}-${day} ${timePart.trim()}`);

  const yyyy = formattedDate.getFullYear();
  const mm = String(formattedDate.getMonth() + 1).padStart(2, "0");
  const dd = String(formattedDate.getDate()).padStart(2, "0");

  return `${dd}-${mm}-${yyyy}`;
}

export function replaceDayInDate(
  sourceDate: string, // Format: yyyy-MM-DD
  targetDate: string // Format: DD/MM/YYYY, HH:MI:SS AM
): string {
  console.log("sourceDate", sourceDate);
  const dd = sourceDate.split("-")[2];

  // Split the targetDate into date and time parts
  const [datePart, timePart] = targetDate.split(", ");

  // Extract current components from datePart (DD/MM/YYYY)
  const [, month, year] = datePart.split("/");

  // Return updated date string
  return `${dd}/${month}/${year}, ${timePart}`;
}

export function getMonthDifference(startDate: string, endDate: string): number {
  if (!startDate || !endDate) {
    throw new Error("Start date or end date is undefined or invalid.");
  }

  // Split the dates into year and month properly

  const [startYear, startMonth] = startDate.split("-").map(Number);
  const [endYear, endMonth] = endDate.split("-").map(Number);

  // Calculate the difference in years and months
  const yearDifference = endYear - startYear;
  const monthDifference = endMonth - startMonth;

  // Total months difference
  return yearDifference * 12 + monthDifference;
}

export function calculateDueDate1(
  startDateStr: string,
  duration: number,
  durationType: number,
  inputFormat: "YYYY-MM-DD" | "DD-MM-YYYY" = "YYYY-MM-DD"
): string {
  let year: number, month: number, day: number;

  if (inputFormat === "YYYY-MM-DD") {
    [year, month, day] = startDateStr.split("-").map(Number);
  } else {
    [day, month, year] = startDateStr.split("-").map(Number);
  }

  const startDate = new Date(Date.UTC(year, month - 1, day));
  let resultDate = new Date(startDate);

  switch (durationType) {
    case 1: // Month interval
      resultDate.setUTCMonth(resultDate.getUTCMonth() + (duration - 1));
      break;

    case 2: // Week interval
      resultDate.setUTCDate(resultDate.getUTCDate() + (duration - 1) * 7);
      break;

    case 3: // Day interval
      resultDate.setUTCDate(resultDate.getUTCDate() + duration);
      break;

    default:
      throw new Error("Invalid duration type");
  }

  const yyyy = resultDate.getUTCFullYear();
  const mm = String(resultDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(resultDate.getUTCDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export function calculateDueDate(
  dateStr: string,
  duration: number,
  durationType: number
): string {
  const date = new Date(dateStr);

  switch (durationType) {
    case 1: // Months
      date.setMonth(date.getMonth() + (duration - 1));
      break;
    case 2: // Weeks
      date.setDate(date.getDate() + (duration - 1) * 7);
      break;
    case 3: // Days
      date.setDate(date.getDate() + (duration - 1));
      break;
    default:
      throw new Error(
        "Invalid duration type. Use 1 for months, 2 for weeks, 3 for days."
      );
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // JS months are 0-based
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}
// export function getMonthDifference(startDate: string, endDate: string): number {
//   if (!startDate || !endDate) {
//     throw new Error('Start date or end date is undefined or invalid.');
//   }

//   const [startMonth, startYear] = startDate.split('-').map(Number);
//   const [endMonth, endYear] = endDate.split('-').map(Number);

//   const yearDifference = endYear - startYear;
//   const monthDifference = endMonth - startMonth;

//   return yearDifference * 12 + monthDifference;
// }

export function formatDate_Time(isoDate: any) {
  const date = new Date(isoDate);

  // Get date components
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  // Get time components
  let hours = date.getHours();
  let minutes = String(date.getMinutes()).padStart(2, "0");
  let seconds = String(date.getSeconds()).padStart(2, "0");

  // Convert hours to 12-hour format and determine AM/PM
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Format the time
  const time = `${hours}:${minutes}:${seconds} ${ampm}`;

  // Return the final formatted date and time
  return `${day}/${month}/${year}, ${time}`;
}

export const convertToFormattedDateTime = (input: string): string => {
  const [date, time] = input.split(", ");
  const [day, month, year] = date.split("/");
  const [rawHours, minutes, seconds] = time.split(":");
  const period = time.includes("PM") ? "PM" : "AM";

  let hours = parseInt(rawHours, 10);
  if (period === "PM" && hours < 12) {
    hours += 12;
  }
  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const shortYear = year.slice(-2);

  return `${day}${month}${shortYear}${String(hours).padStart(
    2,
    "0"
  )}${minutes}`;
};

export function timeFormat(Time: string) {
  // Split input string into start and end time
  const [startTimeString, endTimeString] = Time.split(" to ");

  // Function to convert 24-hour time to 12-hour format
  const formatTo12Hour = (timeString: string) => {
    const [time, modifier] = timeString.trim().split(" "); // Split time and AM/PM
    let [hours, minutes] = time.split(":").map(Number);

    // Ensure hours stay within 1-12 for 12-hour format
    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    // Return formatted time
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${modifier}`;
  };

  // Format start and end times
  const startTime = formatTo12Hour(startTimeString);
  const endTime = formatTo12Hour(endTimeString);

  // Return both formatted times as an object
  return { startTime, endTime };
}

export function generateClassDurationString(
  refClassCount: number,
  refMonthDuration: number
): string {
  return `${refClassCount} Class${
    refClassCount > 1 ? "es" : ""
  } in ${refMonthDuration} Month${refMonthDuration > 1 ? "s" : ""} Duration`;
}

export function generateFileName(): string {
  // Generate a random string of 6 alphabets
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@$*";
  const randomChars = Array.from({ length: 6 }, () =>
    alphabets.charAt(Math.floor(Math.random() * alphabets.length))
  ).join("");

  // Get current date in DDMMYYYY format
  const today = new Date();
  const datePart = `${String(today.getDate()).padStart(2, "0")}${String(
    today.getMonth() + 1
  ).padStart(2, "0")}${today.getFullYear()}`;

  // Combine random characters with date
  return `${randomChars}${datePart}`;
}

export async function getImageBase64(
  imagePath: string
): Promise<string | null> {
  try {
    if (!imagePath) {
      return null;
    }
    const filePath = path.resolve(imagePath);
    const fileBuffer = await fs.promises.readFile(filePath); // Read image file
    return fileBuffer.toString("base64"); // Convert file buffer to base64 string
  } catch (error) {
    console.error(`Error reading image at path: ${imagePath}`, error);
    return null; // Return null if image reading fails
  }
}

export function processFixedDate() {
  // Define the fixed date
  const dateString = "2025-03-07";

  // Convert the date string to a Date object
  const date: any = new Date(dateString);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format. Please use YYYY-MM-DD.");
  }

  // Format the date to a more readable format (e.g., "March 7, 2025")
  const options: any = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);

  // Calculate the difference between the date and today
  const today: any = new Date();
  const timeDiff = date - today; // Difference in milliseconds
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert to days

  return {
    original: dateString,
    formatted: formattedDate,
    daysUntil: daysDiff,
  };
}

export async function getDaysDifference(dateStr: string) {
  function parseDateOnly(dateStr: string): Date {
    const [datePart] = dateStr.split(",");
    const [day, month, year] = datePart.trim().split("/").map(Number);
    return new Date(year, month - 1, day); // Only year, month, day
  }

  const date1 = parseDateOnly(CurrentTime());
  const date2 = parseDateOnly(dateStr);

  const diffInMs = Math.abs(date2.getTime() - date1.getTime());
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return diffInDays + 1;
}

export const dayInterest = async (loanAmt: number, interest: number) => {
  try {
    const dayInterestAmt = (loanAmt * (interest * 12) * 1) / 100 / 365;
    return dayInterestAmt;
  } catch (error) {
    console.log("error", error);
    return 0;
  }
};


export function convertToYMD(todayDate: string = ""): string {
  if (!todayDate) return ""; // or handle default case

  const [datePart, timePartWithPeriod] = todayDate.split(", ");
  const [day, month, year] = datePart.split("/").map(Number);

  const [timePart, period] = timePartWithPeriod.split(" ");
  let [hours, minutes, seconds] = timePart.split(":").map(Number);

  if (period.toUpperCase() === "PM" && hours < 12) hours += 12;
  if (period.toUpperCase() === "AM" && hours === 12) hours = 0;

  const date = new Date(year, month - 1, day, hours, minutes, seconds);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

export const bankType = (status: boolean) => {
  if (status) {
    return [1, 2];
  } else {
    return [1];
  }
};

export function formatToCustomDateTime(dateInput: string | Date): string {
  const date = new Date(dateInput);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const period = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
  const formattedHours = String(hours).padStart(2, "0");

  return `${day}/${month}/${year}, ${formattedHours}:${minutes}:${seconds} ${period}`;
}
