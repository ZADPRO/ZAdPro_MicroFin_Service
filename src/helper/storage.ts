// fileHandler.ts
import fs from "fs";
import path from "path";
import { Readable } from "stream";

// Define the type for the file object that Hapi provides
interface HapiFile {
  hapi: {
    filename: string;
    headers: Record<string, string>;
  };
  pipe: (dest: NodeJS.WritableStream) => Readable; // Specify the pipe method
}

// Function to generate a unique filename
const generateUniqueFilename = (originalName: string): string => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  let uniqueName = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueName += characters[randomIndex];
  }

  const extension = path.extname(originalName); // Get the original file extension
  return uniqueName + extension; // Append the original extension to the unique name
};

export async function storeFile(
  file: any,
  uploadType: number
): Promise<string> {
  let uploadDir = "";

  // Define upload directory based on uploadType
  if (uploadType === 1) {
    uploadDir = path.join(process.cwd(), "./src/assets/profile"); // Profile folder
  } else if (uploadType === 2) {
    uploadDir = path.join(process.cwd(), "./src/assets/aadhar"); // Aadhar folder
  } else if (uploadType === 3) {
    uploadDir = path.join(process.cwd(), "./src/assets/pan"); // Pan folder
  } else if (uploadType === 4) {
    uploadDir = path.join(process.cwd(), "./src/assets/referenceAd"); // reference Aadhar folder
  }

  // Ensure the directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Check if the file object has 'hapi.filename' property
  if (!file.hapi || !file.hapi.filename) {
    throw new Error("File does not have a valid filename property");
  }

  // Generate the file path (file name and extension)
  const fileExtension = path.extname(file.hapi.filename);
  const fileName = `${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}${fileExtension}`;
  console.log("Generated file name:", fileName);

  const filePath = path.join(uploadDir, fileName);
  console.log("Storing file at:", filePath);

  // Store the file
  await new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);
    file.pipe(fileStream);

    fileStream.on("finish", resolve);
    fileStream.on("error", (err) => {
      console.error("Error during file write:", err);
      reject(err);
    });
  });

  return filePath; // Return the file path for further usage
}

export const viewFile = (filePath: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      filePath,
      (err: NodeJS.ErrnoException | null, data?: Buffer) => {
        if (err) {
          return reject(err);
        }
        resolve(data!); // Return the file buffer
      }
    );
  });
};

export const deleteFile = async (filePath: string): Promise<void> => {
  console.log("filePath line ----------------- 94 \n", filePath);
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting old file:", err);
        return reject(err);
      }
      console.log("Old file deleted successfully");
      resolve();
    });
  });
};
