// import { Client } from "minio";
// import logger from "./logger";

// const minioClient = new Client({
//   endPoint: process.env.MINIO_ENDPOINT!,
//   port: parseInt(process.env.MINIO_PORT!),
//   useSSL: process.env.MINIO_USE_SSL === "true",
//   accessKey: process.env.MINIO_ACCESS_KEY!,
//   secretKey: process.env.MINIO_SECRET_KEY!,
// });

// export const createUploadUrl = async (fileName: string, expireMins: number) => {
//   try {
//     const bucketName = process.env.MINIO_BUCKET!;
//     const objectName = fileName;
//     const expirySeconds = expireMins * 60;
//     const signedUrl: string = await minioClient.presignedUrl(
//       "PUT",
//       bucketName,
//       objectName,
//       expirySeconds
//     );

//     const fileUrl = await getFileUrl(objectName, expireMins);
//     return { upLoadUrl: signedUrl, fileUrl: fileUrl };
//   } catch (error) {
//     console.log("error", error);
//     logger.info(`\n\nError IN Generating the File Upload Url \n\n`);

//     return Error;
//   }
// };

// export const getFileUrl = async (fileName: string, expireMins: number) => {
//   try {
//     const bucketName = process.env.MINIO_BUCKET!;
//     const objectName = fileName;
//     const expirySeconds = expireMins * 60;

//     const fileUrl = await minioClient.presignedUrl(
//       "GET",
//       bucketName,
//       objectName,
//       expirySeconds
//     );

//     return fileUrl;
//   } catch (error) {
//     console.log("error", error);
//     logger.info(`\n\nError IN Generating the View File Url \n\n`);
//     return Error;
//   }
// };

// export const getObjectUrl = async (fileName: string, expireMins: number) => {
//   console.log("expireMins", expireMins);
//   console.log("fileName", fileName);
//   try {
//     const presignedUrl = await minioClient.presignedGetObject(
//       process.env.MINIO_BUCKET!,
//       fileName,
//       expireMins * 60
//     );
//     return presignedUrl;
//   } catch (error) {
//     console.log("error", error);
//     return Error;
//   }
// };
