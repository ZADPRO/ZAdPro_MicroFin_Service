import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import { storeFile, viewFile, deleteFile } from "../../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithoutExpire } from "../../helper/token";
import {
  CurrentTime,
  getImageBase64,
  getMonthDifference,
  processFixedDate,
} from "../../helper/common";
import {
  addBankAccountQuery,
  updateBankAccountQuery,
  addBankFundQuery,
  getAgentCountQuery,
  insertAgentBasicDetails,
  insertCommunicationQuery,
  insertDomainQuery,
  selectUserByLogin,
  // updateCommunicationQuery,
  // updateDomainQuery,
  // updateUserQuery,
  getCustomersQuery,
  getCustomerCountQuery,
  addProductQuery,
  updateProductQuery,
  getProductsListQuery,
  getProductsQuery,
  addloanQuery,
  insertReferenceDetails,
  loanQuery,
  insertRepaymentQuery,
  getProductInterestQuery,
  insertPaymentQuery,
  updateRepaymentQuery,
  getBankFundQueryByrefBankFId,
  getBankFundQueryByRangeQuery,
  updateBankAccountBalanceQuery,
  updateBankAccountDebitQuery,
  getAgentQuery,
  getAgentListQuery,
  getCustomersListQuery,
  nameQuery,
  getAllBankAccountQuery,
  getBankFundListQuery,
  getRePaymentScheduleListQuery,
  updateHistoryQuery,
  userExistsQuery,
  updateUserStatusQuery,
  updateFollowUpQuery,
  getBankListQuery,
  getReferenceQuery,
  getloanListQuery,
  getAuditPageQuery,
  getUserDetailsQuery,
  getloanUserListQuery,
  getLoanDataQuery,
  getProductsDurationQuery,
  getLoanQuery,
  updateLoanStatusQuery,
  updateRepaymentScheduleQuery,
  getBankQuery,
  updateBankFundQuery,
} from "./query";
import { buildUpdateQuery, getChanges } from "../../helper/buildquery";
import { reLabelText } from "../../helper/Label";

export class adminRepository {
  public async adminLoginV1(user_data: any, domain_code?: any): Promise<any> {
    const client: PoolClient = await getClient();

    try {
      const params = [user_data.login];
      const users = await client.query(selectUserByLogin, params);

      if (users.rows.length > 0) {
        const user = users.rows[0];

        console.log("User data:", user);
        console.log("User hashed password:", user.refUserHashPassword); // Correct field name
        console.log("Entered password:", user_data.password);

        if (!user.refUserHashPassword) {
          console.error("Error: User has no hashed password stored.");
          return encrypt(
            {
              success: false,
              message: "Invalid login credentials",
            },
            true
          );
        }

        const validPassword = await bcrypt.compare(
          user_data.password,
          user.refUserHashPassword
        );
        if (validPassword) {
          const tokenData = { id: user.refUserId };

          return encrypt(
            {
              success: true,
              message: "Login successful",
              roleId: user.refUserRole,
              token: generateTokenWithoutExpire(tokenData, true),
            },
            true
          );
        }
      }

      return encrypt(
        {
          success: false,
          message: "Invalid login credentials",
        },
        true
      );
    } catch (error) {
      console.error("Error during login:", error);
      return encrypt(
        {
          success: false,
          message: "Internal server error",
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async addNewPersonV1(user_data: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };

    try {

      const basicDetails = user_data.BasicInfo;
      console.log("basicDetails", basicDetails);
      const roleType = basicDetails.user.refRollId;
      console.log("roleType", roleType);
      const referenceDetails = user_data.referenceInfo;

      // Get count for generating user ID
      const countQuery =
        roleType === 2 ? getAgentCountQuery : getCustomerCountQuery;
      const countResult = await executeQuery(countQuery);
      const userCount = parseInt(countResult[0].count, 10) || 0;
      const userIdPrefix = roleType === 2 ? "ZADAG" : "ZADU";
      const newUserId = `${userIdPrefix}${(userCount + 1)
        .toString()
        .padStart(5, "0")}`;
      console.log("newUserId", newUserId);

      await client.query("BEGIN");

      // Users Table Params
      const usersParams = [
        basicDetails.user.refPerFName,
        basicDetails.user.refPerLName,
        newUserId,
        basicDetails.user.refDOB,
        basicDetails.user.refAadharNo,
        basicDetails.user.refPanNo,
        roleType,
        basicDetails.user.activeStatus,
        basicDetails.user?.ProfileImgPath || "",
        basicDetails.user?.refPanPath || "",
        basicDetails.user?.refAadharPath || "",
        CurrentTime(),
        "Admin",
      ];

      const userData = await client.query(insertAgentBasicDetails, usersParams);
      console.log("userData----------------------------------", userData);
      const userId = userData.rows[0].refUserId;
      console.log("userId-------------------", userId);

      // Communication Details
      const userCommunication = [
        userId,
        basicDetails.Communtication.refPerMob,
        basicDetails.Communtication.refPerEmail,
        basicDetails.Communtication.refPerAddress,
        basicDetails.Communtication.refPerDistrict,
        basicDetails.Communtication.refPerState,
        basicDetails.Communtication.refPerPincode,
        CurrentTime(),
        "Admin",
      ];
      const communicationData = await client.query(
        insertCommunicationQuery,
        userCommunication
      );

      // Hash the password using bcrypt
      const hashedPassword = await bcrypt.hash(
        user_data.DomainInfo.refUserPassword,
        10
      );

      // Domain & Authentication Data
      const domainParams = [
        userId,
        user_data.DomainInfo.refUserPassword,
        hashedPassword,
        CurrentTime(),
        "Admin",
      ];
      const domainData = await client.query(insertDomainQuery, domainParams);

      const insertedReferences: any[] = [];
      const references = Array.isArray(user_data.reference)
        ? user_data.reference
        : [];
      console.log("references-----------------", references);

      if (user_data.reference) {
        const insertPromises = user_data.reference.map(async (element: any) => {
          const {
            refRName,
            refRPhoneNumber,
            refRAddress,
            refAadharNumber,
            refPanNumber,
          } = element;

          const usersParams = [
            userId,
            refRName,
            refRPhoneNumber,
            refRAddress,
            refAadharNumber,
            refPanNumber,
            CurrentTime(),
            "Admin",
          ];

          // Await the query execution
          const referenceData = await client.query(
            insertReferenceDetails,
            usersParams
          );
          insertedReferences.push(referenceData);
        });
      }

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message:
            roleType === 2
              ? "Agent added successfully"
              : "Customer added successfully",
          userId: userId,
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      console.log("Error:", error);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Data insertion failed. Please try again.",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async getPersonV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    try {
      // Ensure roleId and refCustId are provided
      const { roleId, refUserId } = userData;
      if (!roleId) {
        throw new Error("Role ID is missing");
      }
      if (!refUserId) {
        throw new Error("refUserId is missing or undefined");
      }

      // Prepare query and parameters based on roleId
      let query: string;
      let params: any[];

      switch (roleId) {
        case 2: // Agent
          query = getAgentQuery;
          params = [refUserId]; // Pass Agent data and refCustId
          break;
        case 3: // Customer
          query = getCustomersQuery;
          params = [refUserId]; // Pass Customer data and refCustId
          break;
        default:
          throw new Error("Invalid roleId provided");
      }

      // Ensure getReferenceQuery receives a parameter
      const getReference = await executeQuery(getReferenceQuery, [refUserId]);
      console.log(
        "getReference-------------------------------------------------------------------------420",
        getReference
      );

      const getAudit = await executeQuery(getAuditPageQuery, [refUserId]);

      const result = await client.query(query, params);

      // Extract the data from query result
      const data = result.rows;

      // Convert images to base64 format
      const dataWithImages = await Promise.all(
        data.map(async (row: any) => {
          try {
            // Check if the image paths are valid
            const profileImgPath = row.refUserProfile;
            const panImgPath = row.refPanPath;
            const aadharImgPath = row.refAadharPath;

            const profileImgBuffer = profileImgPath
              ? await viewFile(profileImgPath)
              : "";
            const profileImgBase64 = profileImgPath
              ? profileImgBuffer.toString("base64")
              : "";

            const panImgBuffer = panImgPath ? await viewFile(panImgPath) : "";
            const panImgBase64 = panImgPath
              ? panImgBuffer.toString("base64")
              : "";

            const aadharImgBuffer = aadharImgPath
              ? await viewFile(aadharImgPath)
              : "";
            const aadharImgBase64 = aadharImgPath
              ? aadharImgBuffer.toString("base64")
              : "";

            return {
              ...row,
              ProfileImgBase64: profileImgBase64,
              PanImgBase64: panImgBase64,
              AadharImgBase64: aadharImgBase64,
            };
          } catch (imgError) {
            console.error(
              `Error processing images for row ${row.id}:`,
              imgError
            );
            return {
              ...row,
              ProfileImgBase64: null,
              PanImgBase64: null,
              AadharImgBase64: null,
            };
          }
        })
      );

      // Return success response with data
      return encrypt(
        {
          success: true,
          message:
            roleId === 2
              ? "Returned Agent successfully"
              : "Returned Customer successfully",
          data: dataWithImages,
          getReference: getReference,
          getAudit: getAudit,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      // Handle errors and return appropriate response
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          token: generateTokenWithoutExpire(token, true),
          error: errorMessage,
        },
        true
      );
    } finally {
      client.release(); // Ensure to release the client connection after query execution
    }
  }
  public async getPersonListV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    console.log("tokendata.id", tokendata.id);
    try {
      // Ensure roleId is provided
      if (!userData.roleId) {
        throw new Error("Role ID is missing");
      }

      const roleId = userData.roleId;
      let query;

      // Check roleId and fetch data accordingly
      if (roleId === 2) {
        // Agent
        query = getAgentListQuery; // Define the query to get agent data
      } else if (roleId === 3) {
        // Customer
        query = getCustomersListQuery; // Define the query to get customer data
      } else {
        throw new Error("Invalid roleId provided");
      }

      // Execute the query
      const result = await executeQuery(query);
      console.log("result", result);

      // Fetch the name data based on token ID
      const name = await client.query(nameQuery, [tokendata.id]);
      console.log("name", name);

      // Return success response with the result
      return encrypt(
        {
          success: true,
          message:
            roleId === 2
              ? "Returned Agent successfully"
              : "Returned Customer successfully",
          name: name.rows,
          data: result, // Return data with base64 images
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  // public async updatePersonV1(user_data: any, tokendata: any): Promise<any> {
  //   const client: PoolClient = await getClient();
  //   try {
  //     await client.query("BEGIN");

  //     const userId = user_data.userId; // Ensure userId is provided
  //     const basicDetails = user_data.BasicInfo;

  //     // Update Users Table
  //     const usersParams = [
  //       basicDetails.user.refPerFName,
  //       basicDetails.user.refPerLName,
  //       basicDetails.user.refDOB,
  //       basicDetails.user.refAadharNo,
  //       basicDetails.user.refPanNo,
  //       basicDetails.user.refRollId,
  //       basicDetails.user.activeStatus,
  //       CurrentTime(),
  //       "Admin",
  //       basicDetails.user.ProfileImgPath || "",
  //       basicDetails.user.refPanPath || "",
  //       basicDetails.user.refAadharPath || "",
  //       userId,
  //     ];
  //     const userDetails = await client.query(updateUserQuery, usersParams);

  //     // Update Communication Details
  //     const userCommunication = [
  //       basicDetails.Communtication.refPerMob,
  //       basicDetails.Communtication.refPerEmail,
  //       basicDetails.Communtication.refPerAddress,
  //       basicDetails.Communtication.refPerDistrict,
  //       basicDetails.Communtication.refPerState,
  //       basicDetails.Communtication.refPerPincode,
  //       CurrentTime(),
  //       "Admin",
  //       userId,
  //     ];
  //     const UserCommunicationDetails = await client.query(
  //       updateCommunicationQuery,
  //       userCommunication
  //     );

  //     const txnHistoryParams = [
  //       3,
  //       user_data.userId,
  //       "Update Partners",
  //       CurrentTime(),
  //       "Admin",
  //     ];
  //     const txnHistoryResult = await client.query(
  //       updateHistoryQuery,
  //       txnHistoryParams
  //     );

  //     await client.query("COMMIT");

  //     return encrypt(
  //       {
  //         success: true,
  //         message: "User updated successfully",
  //         BasicDetails: userDetails,
  //         CommunicationDetails: UserCommunicationDetails,
  //         // DomainDetails: userDomainData
  //       },
  //       true
  //     );
  //   } catch (error) {
  //     console.error("Error updating user:", error);
  //     await client.query("ROLLBACK");

  //     return encrypt(
  //       {
  //         success: false,
  //         message: "Update failed",
  //       },
  //       true
  //     );
  //   } finally {
  //     client.release();
  //   }
  // }
  public async updatePersonV1(user_data: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };
    try {
      await client.query("BEGIN");


      const userId = user_data.userId;
      const { user, Communtication } = user_data.BasicInfo || {};

      // Check if userId exists
      const userExistsResult = await client.query(userExistsQuery, [userId]);
      if (parseInt(userExistsResult.rows[0]?.count || "0") === 0) {
        await client.query("ROLLBACK");
        return encrypt(
          {
            success: false,
            message: "Invalid user ID",
            token: generateTokenWithoutExpire(token, true)
          },
          true
        );
      }

      // Fetch existing user details
      const oldUserData = await client.query(getUserDetailsQuery, [userId]);
      console.log("Old User Data:", oldUserData.rows);

      // Prepare update data
      const updatedUserData: any = {};
      const updatedCommunicationData: any = {};

      if (user) {
        Object.assign(updatedUserData, {
          refUserFname: user.refPerFName,
          refUserLname: user.refPerLName,
          refUserDOB: user.refDOB,
          refAadharNo: user.refAadharNo,
          refPanNo: user.refPanNo,
          refUserRole: user.refRollId,
          refActiveStatus: user.activeStatus,
          refUserProfile: user.ProfileImgPath,
          refPanPath: user.refPanPath,
          refAadharPath: user.refAadharPath,
        });
      }

      if (Communtication) {
        Object.assign(updatedCommunicationData, {
          refUserMobileNo: Communtication.refPerMob,
          refUserEmail: Communtication.refPerEmail,
          refUserAddress: Communtication.refPerAddress,
          refUserDistrict: Communtication.refPerDistrict,
          refUserState: Communtication.refPerState,
          refUserPincode: Communtication.refPerPincode,
        });
      }

      // Remove undefined values
      Object.keys(updatedUserData).forEach(
        (key) =>
          updatedUserData[key] === undefined && delete updatedUserData[key]
      );
      Object.keys(updatedCommunicationData).forEach(
        (key) =>
          updatedCommunicationData[key] === undefined &&
          delete updatedCommunicationData[key]
      );

      // Perform updates
      if (Object.keys(updatedUserData).length > 0) {
        updatedUserData.updatedAt = CurrentTime();
        updatedUserData.updatedBy = "Admin";
        const { updateQuery, values } = buildUpdateQuery(
          "users",
          updatedUserData,
          { column: "refUserId", value: userId }
        );
        await client.query(updateQuery, values);
      }

      if (Object.keys(updatedCommunicationData).length > 0) {
        updatedCommunicationData.updatedAt = CurrentTime();
        updatedCommunicationData.updatedBy = "Admin";
        const { updateQuery, values } = buildUpdateQuery(
          "refCommunication",
          updatedCommunicationData,
          { column: "refUserId", value: userId }
        );
        await client.query(updateQuery, values);
      }

      // Get changes and exclude updatedAt
      const changedData = getChanges(
        { ...updatedUserData, ...updatedCommunicationData },
        oldUserData.rows[0]
      );
      delete changedData.updatedAt;
      delete changedData.updatedBy;

      if (Object.keys(changedData).length > 0) {
        interface Change {
          oldValue: string;
          newValue: string;
        }

        interface LabeledChange {
          label: string;
          data: Change;
        }

        const labeledChanges: LabeledChange[] = Object.entries(
          changedData
        ).reduce<LabeledChange[]>((acc, [key, value]) => {
          acc.push({
            label: reLabelText(key),
            data: value,
          });
          return acc;
        }, []);

        // Convert the labeledChanges array to a JSON string
        const labeledChangesString = JSON.stringify(labeledChanges);

        await client.query(updateHistoryQuery, [
          "1",
          userId,
          labeledChangesString,
          CurrentTime(),
          token.id,
        ]);
      }

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "User updated successfully",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      console.error("Error updating user:", error);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Update failed",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async profileUploadV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id };

    try {
      const { profile, aadhar, pan } = userData;
      const images: any = { profile, aadhar, pan }; // Maintain key structure
      console.log("Received images:", images);

      let filePaths: { images: { [key: string]: string } } = { images: {} };
      let storedFiles: any[] = [];

      // Define upload types mapping
      const uploadTypes: { [key: string]: number } = {
        profile: 1,
        aadhar: 2,
        pan: 3,
      };

      for (const key of Object.keys(images)) {
        if (images[key] && typeof images[key] !== "string") {
          // Check if the file exists and is not a string
          console.log(`Storing Image for ${key}...`);

          // Extract filename from the hapi property
          const filename = images[key].hapi?.filename;
          if (!filename) {
            console.error(`No valid filename for ${key}`);
            continue; // Skip to the next image if filename is missing
          }

          // Store file and get path
          const imagePath = await storeFile(images[key], uploadTypes[key]);
          console.log(`Stored ${key} Image Path:`, imagePath);
          filePaths.images[key] = imagePath;

          // Convert image to Base64
          const imageBuffer = await viewFile(imagePath);
          const imageBase64 = imageBuffer.toString("base64");

          storedFiles.push({
            filename: filename,
            content: imageBase64,
            contentType: "image/jpeg", // Adjust based on image type
          });
        } else {
          filePaths.images[key] = "";
          console.log(`No image uploaded for ${key}, skipping...`);
        }
      }

      // Return success response with stored images
      return encrypt(
        {
          success: true,
          message: "Images Stored Successfully",
          filePaths: filePaths,
          files: storedFiles,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      console.error("Error occurred:", error);
      return encrypt(
        {
          success: false,
          message: "Error In Storing the Images",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async addBankAccountV1(userData: any, tokendata: any): Promise<any> {
    console.log("userData", userData);
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID

    try {
      await client.query("BEGIN"); // Start Transaction

      // Extract bank account details from userData
      const { refBankName, refBankAccountNo, refBankAddress, refBalance } =
        userData;
      console.log("userData", userData);

      // Insert into refBankAccounts table
      const result = await client.query(addBankAccountQuery, [
        refBankName,
        refBankAccountNo,
        refBankAddress,
        refBalance,
        CurrentTime(),
        "Admin",
      ]);

      console.log("Bank Account Insert Result:", result);

      // Commit transaction
      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Bank account details successfully inserted.",
          data: result,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");

      console.error("Error inserting bank account:", error);

      return encrypt(
        {
          success: false,
          message: "Bank account insertion failed",
          error: error.message || "An unknown error occurred",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async updateBankAccountV1(
    user_data: any,
    tokendata: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    try {
      await client.query("BEGIN"); // Start the transaction

      // Extract required data from user_data
      const { refBankId, refBankName, refBankAccountNo, refBankAddress } =
        user_data;

      // Validate if the required bank account details are provided
      if (!refBankId || !refBankName || !refBankAccountNo || !refBankAddress) {
        throw new Error("Missing required bank account details.");
      }

      // Define the parameters for the update query
      const bankAccountParams = [
        refBankName,
        refBankAccountNo,
        refBankAddress,
        CurrentTime(),
        "Admin",
        refBankId,
      ];

      const updateResult = await client.query(
        updateBankAccountQuery,
        bankAccountParams
      );

      await client.query("COMMIT");

      // Return the success response
      return encrypt(
        {
          success: true,
          message: "Bank account details updated successfully.",
          updateResult: updateResult,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error: any) {
      // Rollback the transaction in case of any errors
      await client.query("ROLLBACK");

      console.error("Error updating bank account:", error);

      // Return the error response
      return encrypt(
        {
          success: false,
          message: "Bank account update failed",
          error: error.message || "An unknown error occurred",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } finally {
      // Release the client back to the pool after the transaction
      client.release();
    }
  }
  public async getBankAccountListV1(
    userData: any,
    tokendata: any
  ): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID
    console.log("token", token);
    const client: PoolClient = await getClient();
    try {
      const allBankAccountList = await executeQuery(getAllBankAccountQuery);

      const name = await client.query(nameQuery, [tokendata.id]);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned Bank Account list successfully",
          name: name.rows,
          BankAccount: allBankAccountList,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async addProductV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    try {
      await client.query("BEGIN"); // Start Transaction

      const {
        refProductName,
        refProductInterest,
        refProductDuration,
        refProductStatus,
        refProductDescription,
      } = userData;

      // Insert bank account details using refUserId
      const result = await client.query(addProductQuery, [
        refProductName,
        refProductInterest,
        refProductDuration,
        refProductStatus,
        refProductDescription,
        CurrentTime(),
        "Admin",
      ]);

      console.log(" Insert Result:", result);

      await client.query("COMMIT"); // Commit Transaction

      return encrypt(
        {
          success: true,
          message: "Product details inserted successfully.",
          data: result,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");

      console.error("Error inserting product details:", error);

      return encrypt(
        {
          success: false,
          message: "product insertion failed",
          error: error.message || "An unknown error occurred",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async updateProductV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    try {
      await client.query("BEGIN");

      // Update Users Table
      const {
        refProductId,
        refProductName,
        refProductInterest,
        refProductDuration,
        refProductStatus,
        refProductDescription,
      } = userData;
      await client.query(updateProductQuery, [
        refProductId,
        refProductName,
        refProductInterest,
        refProductDuration,
        refProductStatus,
        refProductDescription,
        CurrentTime(),
        "Admin",
      ]);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "product updated successfully",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      console.error("Error updating product:", error);

      await client.query("ROLLBACK");

      return encrypt(
        {
          success: false,
          message: "Update failed",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async productListV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    try {
      const productList = await client.query(getProductsListQuery);
      const name = await client.query(nameQuery, [tokendata.id]);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned list of products successfully",
          name: name.rows,
          products: productList.rows, // Make sure to use .rows to get the data
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async getProductV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID

    try {
      // Ensure customer is provided
      if (!userData.product) {
        throw new Error("product data is missing");
      }

      const params = [userData.product];

      const product = await executeQuery(getProductsQuery, params);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned products by name successfully",
          product: product, // Make sure to use .rows to get the data
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async referenceAadharUploadV1(
    userData: any,
    tokendata: any
  ): Promise<any> {
    const token = { id: tokendata.id };
    try {
      // Extract the image from userData
      const image = userData.Image;

      // Ensure that only one image is provided
      if (!image) {
        throw new Error("Please provide an image.");
      }

      let filePath: string = "";
      let storedFiles: any[] = [];

      // Store the image
      console.log("Storing image...");
      filePath = await storeFile(image, 4);

      // Read the file buffer and convert it to Base64
      const imageBuffer = await viewFile(filePath);
      const imageBase64 = imageBuffer.toString("base64");

      storedFiles.push({
        filename: path.basename(filePath),
        content: imageBase64,
        contentType: "image/jpeg", // Assuming the image is in JPEG format
      });

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Image Stored Successfully",
          filePath: filePath,
          files: storedFiles,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      console.error("Error occurred:", error);
      return encrypt(
        {
          success: false,
          message: "Error in Storing the Image",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async addReferenceV1(user_data: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };

    try {
      await client.query("BEGIN");

      const userId = user_data.refUserId;
      const insertedReferences: any[] = [];

      // Use Promise.all to handle concurrent insertions
      const insertPromises = user_data.references.map(async (element: any) => {
        const {
          refRName,
          refRPhoneNumber,
          refRAddress,
          refAadharNumber,
          refPanNumber,
        } = element;

        const usersParams = [
          userId,
          refRName,
          refRPhoneNumber,
          refRAddress,
          refAadharNumber,
          refPanNumber,
          CurrentTime(),
          "Admin",
        ];

        // Await the query execution
        const referenceData = await client.query(
          insertReferenceDetails,
          usersParams
        );
        insertedReferences.push(referenceData);
      });

      // Wait for all insertions to complete
      await Promise.all(insertPromises);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "All references added successfully",
          insertedReferences: insertedReferences,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error: any) {
      console.log("Error:", error);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Data insertion failed. Please try again.",
          error: error.message || "Unknown error",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async getReferenceV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id }; // Extract token ID

    try {
      // Ensure customer is provided
      if (!userData.userId) {
        throw new Error("userId data is missing");
      }

      const params = [userData.userId];

      const reference = await executeQuery(getReferenceQuery, params);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned reference by user successfully",
          reference: reference, // Make sure to use .rows to get the data
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async addBankFundV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID

    try {
      await client.query("BEGIN"); // Start Transaction

      // Extract bank fund details from userData
      const {
        refBankId,
        refbfTransactionDate,
        refbfTransactionType, // Assuming it's in the userData
        refbfTransactionAmount, // Assuming it's in the userData
        refTxnId,
        refFundType,
      } = userData;

      // 1. Insert into refBankFund table
      const insertBankFundResult = await client.query(addBankFundQuery, [
        refBankId,
        refbfTransactionDate,
        refbfTransactionType,
        refbfTransactionAmount,
        refTxnId,
        refFundType,
        CurrentTime(),
        "Admin",
      ]);

      // 2. Update refBalance in refBankAccounts table based on refbfTransactionType
      let updatedBalanceQuery: string;
      let balanceUpdateAmount: number;

      // Determine the balance update based on transaction type
      if (
        refbfTransactionType === "credit" ||
        refbfTransactionType === "deposit"
      ) {
        balanceUpdateAmount = refbfTransactionAmount;

        console.log(
          "balanceUpdateAmount---------------------------------------------------842",
          balanceUpdateAmount
        );

        updatedBalanceQuery = updateBankAccountBalanceQuery;
      } else if (refbfTransactionType === "debit") {
        balanceUpdateAmount = refbfTransactionAmount; // Subtract the amount for debit

        console.log(
          "balanceUpdateAmount----------------------------------851",
          balanceUpdateAmount
        );

        updatedBalanceQuery = updateBankAccountDebitQuery;
      } else {
        throw new Error("Invalid transaction type");
      }

      // Execute balance update
      const balanceResult = await client.query(updatedBalanceQuery, [
        balanceUpdateAmount,
        refBankId,
        CurrentTime(),
        "Admin",
      ]);

      console.log(
        "balanceResult--------------------------------------------860",
        balanceResult
      );

      // Commit transaction
      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Bank fund successfully inserted and balance updated.",
          data: insertBankFundResult,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");

      console.error("Error inserting bank fund and updating balance:", error);

      return encrypt(
        {
          success: false,
          message: "Bank fund insertion or balance update failed",
          error: error.message || "An unknown error occurred",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async getBankListV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID

    try {
      const BankList = await client.query(getBankListQuery);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned list of documents successfully",
          BankFund: BankList.rows, // Make sure to use .rows to get the data
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async viewBankFundV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID

    try {
      // Ensure that either refBankFId or date range (startDate and endDate) is provided
      if (!userData.refBankFId && !(userData.startDate && userData.endDate)) {
        throw new Error(
          "Either refBankFId or a date range (startDate, endDate) is required"
        );
      }

      let params: any[] = [];
      let query: string;

      if (userData.refBankFId) {
        // If refBankFId is provided, use the query to fetch by refBankFId
        params = [userData.refBankFId];
        query = getBankFundQueryByrefBankFId;
      } else if (userData.startDate && userData.endDate) {
        // If startDate and endDate are provided, use the range query
        params = [userData.startDate, userData.endDate];
        query = getBankFundQueryByRangeQuery;
      } else {
        throw new Error("Invalid data for bank fund query");
      }

      // Execute the query
      const bankFund = await executeQuery(query, params);

      // Check if no records were found
      if (bankFund.length === 0) {
        return encrypt(
          {
            success: false,
            message: "No bank fund found",
            token: generateTokenWithoutExpire(token, true)
          },
          true
        );
      }

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned bank fund successfully",
          bankFund: bankFund, // If bankFund is an array
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async getBankFundListV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    try {
      const BankFundList = await client.query(getBankFundListQuery);

      const name = await client.query(nameQuery, [tokendata.id]);
      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned list of products successfully",
          name: name.rows,
          BankFund: BankFundList.rows, // Make sure to use .rows to get the data
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async addLoanV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    try {
      await client.query("BEGIN");

      const {
        refProductId,
        refLoanAmount,
        refPayementType,
        refRepaymentStartDate,
        refLoanStatus,
        refBankId,
        refLoanBalance,
        isInterestFirst,
        interest,
        userId,
      } = userData;

      const productDetails = await executeQuery(getProductsDurationQuery, [
        refProductId,
      ]);

      const getBankAccount = await executeQuery(getBankQuery, [refBankId]);
      console.log(
        "getBankAccount-------------------------------------------------1572",
        getBankAccount
      );

      // Extract balance
      const { refBalance } = getBankAccount[0];
      console.log(
        "refBalance-----------------------------------------------------1576",
        refBalance
      );

      // Validate bank balance
      if (refBalance < refLoanAmount) {
        throw new Error("Insufficient balance in the bank.");
      }

      if (!productDetails || productDetails.length === 0) {
        throw new Error("Invalid Product ID. No duration found.");
      }

      const durationInMonths = parseInt(
        productDetails[0].refProductDuration,
        10
      );
      console.log(
        "durationInMonth------------------------------------------1591",
        durationInMonths
      );

      if (!refRepaymentStartDate) {
        throw new Error("Missing refRepaymentStartDate.");
      }

      const repaymentDate = new Date(refRepaymentStartDate);
      console.log("repaymentDate", repaymentDate);
      repaymentDate.setMonth(repaymentDate.getMonth() + durationInMonths);
      const refLoanDueDate = repaymentDate.toISOString().split("T")[0];
      console.log("refLoanDueDate", refLoanDueDate);

      const getInterest = parseFloat(interest);
      console.log(
        "getInterest--------------------------------------",
        getInterest
      );
      const getPayable = parseFloat(refLoanAmount) + getInterest;
      console.log(
        "getPayable-----------------------------------------------------------",
        getPayable
      );

      const result = await client.query(addloanQuery, [
        userId,
        refProductId,
        refLoanAmount,
        refLoanDueDate,
        refPayementType,
        refRepaymentStartDate,
        refLoanStatus,
        processFixedDate().original,
        refBankId,
        refLoanBalance,
        isInterestFirst,
        interest,
        getPayable,
        CurrentTime(),
        "Admin",
      ]);

      const { refLoanId } = result.rows[0]; // Access refLoanId from the result

      const updateFund = await client.query(updateBankFundQuery, [
        refBankId,
        processFixedDate().original,
        refLoanBalance,
        refLoanId,
        CurrentTime(),
        "Admin",
      ]);
      console.log("updateFund line 1662");

      const updateBalance = await client.query(updateBankAccountDebitQuery, [
        refLoanBalance,
        refBankId,
        CurrentTime(),
        "Admin",
      ]);
      console.log("updateBalance", updateBalance);
      console.log("updateBalance checking line 1668");

      const loanResult = await client.query(loanQuery, [refLoanId]);

      if (loanResult.rows.length === 0) {
        throw new Error("Loan not found.");
      }

      // Fetch product interest from refProducts table
      const productResult = await client.query(getProductInterestQuery, [
        refProductId,
      ]);

      if (productResult.rows.length === 0) {
        throw new Error("Product not found.");
      }

      const { refProductInterest } = productResult.rows[0];

      // Calculate total interest amount for the loan
      const totalInterestAmount = (refProductInterest / 100) * refLoanAmount;

      // Calculate total repayment monthsw
      const monthDifference = getMonthDifference(
        refRepaymentStartDate,
        refLoanDueDate
      );

      // Monthly interest amount (split equally across months)
      const monthlyInterest =
        Math.round((totalInterestAmount / monthDifference) * 100) / 100; // Rounded to 2 decimal places

      // Monthly principal amount (if not interest first)
      const monthlyPrincipal =
        Math.round((refLoanAmount / monthDifference) * 100) / 100; // Rounded to 2 decimal places

      const repaymentParams = [];
      let currentRepaymentDate = new Date(refRepaymentStartDate);

      for (let i = 0; i < monthDifference; i++) {
        const repaymentYear = currentRepaymentDate.getFullYear();
        const repaymentMonth = currentRepaymentDate.getMonth() + 1;
        const repaymentDate = `${repaymentYear}-${repaymentMonth
          .toString()
          .padStart(2, "0")}`;

        // Split the interest across all months
        const interestAmount = monthlyInterest; // Already rounded
        const principalAmount =
          isInterestFirst && i === 0 ? refLoanAmount : monthlyPrincipal; // Already rounded

        repaymentParams.push([
          refLoanId,
          repaymentDate,
          refLoanAmount,
          principalAmount,
          interestAmount,
          "Pending",
          1 + i,
          Math.round((interestAmount + principalAmount) * 100) / 100, // Ensure sum is also rounded
          CurrentTime(),
          "Admin",
        ]);

        currentRepaymentDate.setMonth(currentRepaymentDate.getMonth() + 1);
      }

      // Insert repayment schedules into the database
      for (const params of repaymentParams) {
        await client.query(insertRepaymentQuery, params);
      }

      await client.query("COMMIT"); // Commit Transaction

      return encrypt(
        {
          success: true,
          message: "loan details inserted successfully.",
          data: result,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");

      console.error("Error inserting loan details:", error);

      return encrypt(
        {
          success: false,
          message: "loan insertion failed",
          error: error.message || "An unknown error occurred",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } finally {
      client.release();
    }
  }

  // public async updateLoanV1(userData: any, tokendata: any): Promise<any> {
  //   const client: PoolClient = await getClient();
  //   try {
  //     const { userId,
  //       loanStopStatus
  //     } = userData.userData;

  //     const loanData = await executeQuery(getLoanQuery, [userId]);
  //     console.log("loanData", loanData);

  //     const allPaid = loanData.every((row: any) => row.refReStatus === "Paid");
  //     console.log("allPaid", allPaid);

  //     if (allPaid) {
  //       const updateStatus = await executeQuery(updateLoanStatusQuery, [
  //         userId,
  //       ]);
  //       console.log("updateStatus", updateStatus);
  //     }

  //     return encrypt(
  //       {
  //         success: true,
  //         message: "Loan updated successfully",
  //       },
  //       false
  //     );
  //   } catch (error) {
  //     console.error("Error updating loan:", error);

  //     await client.query("ROLLBACK");

  //     return encrypt(
  //       {
  //         success: false,
  //         message: "Update failed",
  //       },
  //       false
  //     );
  //   } finally {
  //     client.release();
  //   }
  // }
  public async updateLoanV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    try {
      const { userId, loanStopStatus } = userData.userData;

      if (!userId) {
        throw new Error("Invalid userId");
      }

      console.log("userId", userId);
      console.log("loanStopStatus", loanStopStatus);

      const loanData = await executeQuery(getLoanQuery, [userId]);
      console.log("loanData", loanData);

      if (loanData.length === 0) {
        return encrypt(
          {
            success: false,
            message: "No loan data found",
            token: generateTokenWithoutExpire(token, true)
          },
          true
        );
      }

      let updateStatus;

      if (loanStopStatus === "bad debit") {
        updateStatus = await executeQuery(updateLoanStatusQuery, [userId]);
        console.log("Updated Loan Status due to bad debit", updateStatus);
      } else if (loanStopStatus === "Stop Interest") {
        updateStatus = await executeQuery(updateRepaymentScheduleQuery, [
          userId,
        ]);
        console.log(
          "Updated Repayment Schedule due to Stop Interest",
          updateStatus
        );
      }

      return encrypt(
        {
          success: true,
          message: "Loan updated successfully",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error: any) {
      console.error("Error updating loan:", error);
      await client.query("ROLLBACK");

      return encrypt(
        {
          success: false,
          message: error.message || "Update failed",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } finally {
      client.release();
    }
  }

  public async getLoanListV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    try {
      const productList = await client.query(getloanListQuery);
      const name = await client.query(nameQuery, [tokendata.id]);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned list of loan successfully",
          name: name.rows,
          products: productList.rows, // Make sure to use .rows to get the data
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async getLoanAndUserV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID

    try {
      // const productList = await client.query(getloanUserListQuery);
      const name = await client.query(nameQuery, [tokendata.id]);

      const getLoanAndUser = await executeQuery(getloanUserListQuery);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned list of loan successfully",
          name: name.rows,
          getLoanAndUser: getLoanAndUser,
          token: generateTokenWithoutExpire(token, true)
          // products: productList, // Make sure to use .rows to get the data
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async getLoanV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID

    try {
      const { userId } = userData;
      const getLoanData = await executeQuery(getLoanDataQuery, [userId]);

      const allBankAccountList = await executeQuery(getAllBankAccountQuery);

      const productList = await client.query(getProductsListQuery);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned list of loan successfully",
          loanData: getLoanData,
          allBankAccountList: allBankAccountList,
          productList: productList.rows,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async rePaymentScheduleV1(
    userData: any,
    tokendata: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };

    try {
      await client.query("BEGIN");

      const { refLoanId, refRepaymentNumber } = userData;

      // Fetch loan details
      const loanResult = await client.query(loanQuery, [refLoanId]);

      if (loanResult.rows.length === 0) {
        throw new Error("Loan not found.");
      }

      const {
        refLoanAmount,
        refRepaymentStartDate,
        refLoanDueDate,
        isInterestFirst,
        refProductId,
      } = loanResult.rows[0];

      // Fetch product interest from refProducts table
      const productResult = await client.query(getProductInterestQuery, [
        refProductId,
      ]);

      if (productResult.rows.length === 0) {
        throw new Error("Product not found.");
      }

      const { refProductInterest } = productResult.rows[0];

      // Calculate total interest amount for the loan
      const totalInterestAmount = (refProductInterest / 100) * refLoanAmount;

      // Calculate total repayment months
      const monthDifference =
        getMonthDifference(refRepaymentStartDate, refLoanDueDate) + 1;

      // Monthly interest amount (split equally across months)
      const monthlyInterest =
        Math.round((totalInterestAmount / monthDifference) * 100) / 100; // Rounded to 2 decimal places

      // Monthly principal amount (if not interest first)
      const monthlyPrincipal =
        Math.round((refLoanAmount / monthDifference) * 100) / 100; // Rounded to 2 decimal places

      const repaymentParams = [];
      let currentRepaymentDate = new Date(refRepaymentStartDate);

      for (let i = 0; i < monthDifference; i++) {
        const repaymentYear = currentRepaymentDate.getFullYear();
        const repaymentMonth = currentRepaymentDate.getMonth() + 1;
        const repaymentDate = `${repaymentYear}-${repaymentMonth
          .toString()
          .padStart(2, "0")}`;

        // Split the interest across all months
        const interestAmount = monthlyInterest; // Already rounded
        const principalAmount =
          isInterestFirst && i === 0 ? refLoanAmount : monthlyPrincipal; // Already rounded

        repaymentParams.push([
          refLoanId,
          repaymentDate,
          refLoanAmount,
          principalAmount,
          interestAmount,
          "Pending",
          refRepaymentNumber + i,
          Math.round((interestAmount + principalAmount) * 100) / 100, // Ensure sum is also rounded
          CurrentTime(),
          "Admin",
        ]);

        currentRepaymentDate.setMonth(currentRepaymentDate.getMonth() + 1);
      }

      // Insert repayment schedules into the database
      for (const params of repaymentParams) {
        await client.query(insertRepaymentQuery, params);
      }

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: `${monthDifference} repayment schedules inserted successfully.`,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");

      console.error("Error inserting rePayment Schedule", error);

      return encrypt(
        {
          success: false,
          message: "rePayment Schedule insertion failed",
          error: error.message || "An unknown error occurred",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async userFollowUpV1(userData: any, tokendata: any): Promise<any> {
    const token = { id: tokendata.id };
    try {
      const updateUserStatusResult = await executeQuery(updateUserStatusQuery, [
        userData.refRpayId,
        userData.resStatus,
        userData.refFollowUp,
        userData.refComments,
        CurrentTime(),
        "Admin",
      ]);

      console.log("updateUserStatusResult", updateUserStatusResult);

      return encrypt(
        {
          success: true,
          message: "Client FollowUp Data is Updated Successfully",
          UserStatus: updateUserStatusResult,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error: any) {
      return encrypt(
        {
          success: false,
          message: error.message || "Error in FollowUp Data Updated",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async updateFollowUpV1(userData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID
    try {
      await client.query("BEGIN");

      const { refStatusId, refRpayId, resStatus, refFollowUp, refComments } =
        userData;
      await client.query(updateFollowUpQuery, [
        refStatusId,
        refRpayId,
        resStatus,
        refFollowUp,
        refComments,
        CurrentTime(),
        "Admin",
      ]);

      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "updated successfully",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      console.error("Error updating followup:", error);

      await client.query("ROLLBACK");

      return encrypt(
        {
          success: false,
          message: "Update failed",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async ListRePaymentScheduleV1(
    userData: any,
    tokendata: any
  ): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id }; // Extract token ID

    try {
      const RePaymentScheduleList = await client.query(
        getRePaymentScheduleListQuery
      );
      const name = await client.query(nameQuery, [tokendata.id]);

      // Return success response
      return encrypt(
        {
          success: true,
          message: "Returned list of products successfully",
          name: name.rows,
          RePaymentSchedule: RePaymentScheduleList, // Make sure to use .rows to get the data
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error) {
      // Error handling
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error during data retrieval:", error);

      // Return error response
      return encrypt(
        {
          success: false,
          message: "Data retrieval failed",
          error: errorMessage,
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    }
  }
  public async addPaymentV1(paymentData: any, tokendata: any): Promise<any> {
    const client: PoolClient = await getClient();
    const token = { id: tokendata.id };

    try {
      await client.query("BEGIN");

      const {
        refTransactionType,
        refAmount,
        refRpayId,
        refPPaymentDate,
        refLoanId,
        refAgentId,
      } = paymentData;

      // Insert payment into refPayments table

      const paymentResult = await client.query(insertPaymentQuery, [
        refTransactionType,
        refAmount,
        refRpayId,
        refPPaymentDate,
        refLoanId,
        refAgentId,
        CurrentTime(),
        "Admin",
      ]);

      console.log("paymentResult--------------------", paymentResult);

      if (paymentResult.rowCount === 0) {
        throw new Error("Payment insertion failed.");
      }

      // Update refRepaymentSchedule table

      const updateResult = await client.query(updateRepaymentQuery, [
        CurrentTime(),
        "Admin",
        refPPaymentDate,
      ]);

      console.log(
        "updateResult----------------------------------------",
        updateResult
      );

      if (updateResult.rowCount === 0) {
        throw new Error("Repayment schedule update failed.");
      }
      await client.query("COMMIT");

      return encrypt(
        {
          success: true,
          message: "Payment added and repayment status updated successfully.",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } catch (error: any) {
      await client.query("ROLLBACK");

      console.error("Error processing payment", error);

      return encrypt(
        {
          success: false,
          message: "Payment processing failed",
          error: error.message || "An unknown error occurred",
          token: generateTokenWithoutExpire(token, true)
        },
        true
      );
    } finally {
      client.release();
    }
  }
}
