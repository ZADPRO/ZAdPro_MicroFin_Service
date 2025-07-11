import { executeQuery, getClient } from "../../helper/db";
import { PoolClient } from "pg";
import { storeFile, viewFile, deleteFile } from "../../helper/storage";
import path from "path";
import { encrypt } from "../../helper/encrypt";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenWithoutExpire } from "../../helper/token";
import {
  addNewArea,
  addNewAreas,
  addPinCode,
  checkPinCode,
  createNewAreaFromOld,
  filteredArea,
  getAllArea,
  listArea,
  listAreaPrefix,
  movePincode,
  updateArea,
  validatePinCode,
  valPinCode,
} from "./query";
import logger from "../../helper/logger";

export class AreaRepository {
  public async addAreaV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const client: PoolClient = await getClient();

    try {
      await client.query("BEGIN");
      const params = [
        user_data.areaName,
        user_data.areaPrefix,
        user_data.areaPinCode,
      ];
      await client.query(addNewArea, params);
      await client.query("COMMIT");
      return encrypt(
        {
          success: true,
          message: "Overall Report Option Passed Successfully",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      logger.error(`Error in Adding new Area \n\n`, error);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Error in Sending the Overall Report Option",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async checkPinCodeV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const result = await executeQuery(valPinCode, [user_data.pinCode]);
      if (result.length > 0) {
        return encrypt(
          {
            success: true,
            message: "Pincode Validation is Successfully, but Data Present",
            token: generateTokenWithoutExpire(token, true),
            validation: false,
            data: result[0].refAreaName,
            pinCodeId: result[0].refAreaPinCodeId,
          },
          true
        );
      } else {
        return encrypt(
          {
            success: true,
            message: "The Pincode Validation is Successfully and it is unique",
            token: generateTokenWithoutExpire(token, true),
            validation: true,
          },
          true
        );
      }
    } catch (error) {
      console.log("error line ----- 30", error);
      logger.error(`Error in Adding new Area \n\n`, error);
      return encrypt(
        {
          success: false,
          message: "Error in Sending the Overall Report Option",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async listAreaV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const result = await executeQuery(listArea);

      return encrypt(
        {
          success: true,
          message: "Area List Passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          data: result,
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      logger.error(`Error in Listing Area \n\n`, error);
      return encrypt(
        {
          success: false,
          message: "Error in Sending the Overall Report Option",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async movePinCodeV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const result = await executeQuery(movePincode, [
        user_data.areaId,
        user_data.pinCodeId,
      ]);

      return encrypt(
        {
          success: true,
          message: "Pincode Mover to Another Area",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      logger.error(`Error in Moving pincode to another Area \n\n`, error);
      return encrypt(
        {
          success: false,
          message: "Erroring in Moving the Pincode to another Area",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async updateAreaV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const client: PoolClient = await getClient();

    console.log("user_data line ------ 152", user_data);
    try {
      await client.query("BEGIN");
      if (user_data.areaId !== null && user_data.areaId) {
        console.log(" -> Line Number ----------------------------------- 164");
        const params = [
          user_data.areaId,
          user_data.areaName,
          user_data.areaPrefix,
          JSON.stringify(user_data.areaPinCode),
        ];
        await client.query(updateArea, params);
      } else {
        console.log(" -> Line Number ----------------------------------- 172");
        const params = [
          user_data.areaName,
          user_data.areaPrefix,
          JSON.stringify(user_data.areaPinCode),
        ];
        console.log("params", params);
        await client.query(createNewAreaFromOld, params);
      }

      await client.query("COMMIT");
      return encrypt(
        {
          success: true,
          message: "Area and PinCode is Update Successfully",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      logger.error(`Error in Updating area \n\n`, error);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: "Error in Updating the Area",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }
  public async validatePinCodeV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    console.log("user_data line ------ 152", user_data);
    try {
      const details = await executeQuery(validatePinCode, [user_data.pinCode]);
      const areaList = await executeQuery(listAreaPrefix);
      return encrypt(
        {
          success: true,
          message: "Validating the PinCode",
          token: generateTokenWithoutExpire(token, true),
          data: details,
          list: areaList,
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      logger.error(`Error in validating the PinCode\n\n`, error);
      return encrypt(
        {
          success: false,
          message: "Error in validating the PinCode",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  public async areaOptionV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const data = await executeQuery(listAreaPrefix);
      return encrypt(
        {
          success: true,
          message: "Get the Area Options",
          token: generateTokenWithoutExpire(token, true),
          data: data,
        },
        true
      );
    } catch (error) {
      console.log("error line ----- 30", error);
      logger.error(`Error in Getting the Area Options\n\n`, error);
      return encrypt(
        {
          success: false,
          message: "Error in getting the Area Options",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
  // Area Version 2
  public async addNewAreaV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };
    const client: PoolClient = await getClient();

    try {
      const pinCodeCheck = await executeQuery(checkPinCode, [
        user_data.pinCode,
        user_data.mainAreaName,
      ]);
      console.log("pinCodeCheck", pinCodeCheck);
      await client.query("BEGIN");
      let pinCodeId;
      if (pinCodeCheck.length === 0) {
        const addPinCodeResult = await client.query(addPinCode, [
          user_data.pinCode,
          user_data.mainAreaName,
        ]);
        pinCodeId = addPinCodeResult.rows[0].refAreaPinCodeId;
      } else {
        pinCodeId = pinCodeCheck[0].refAreaPinCodeId;
      }
      console.log("pinCodeId", pinCodeId);
      const params = [user_data.areaName, user_data.areaPrefix, pinCodeId];
      await client.query(addNewAreas, params);
      await client.query("COMMIT");
      return encrypt(
        {
          success: true,
          message: "New Area Added Successfully",
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } catch (error) {
      const errorMessage = "Error In Adding New Area In Version 2";
      console.log("errorMessage error line ------ 289", errorMessage);
      logger.error(`\n\n ${errorMessage} \n\n`, error);
      await client.query("ROLLBACK");
      return encrypt(
        {
          success: false,
          message: errorMessage,
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    } finally {
      client.release();
    }
  }

  public async allAreaListV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const areaList = await executeQuery(getAllArea);
      return encrypt(
        {
          success: true,
          message: "Pass All the Area List",
          token: generateTokenWithoutExpire(token, true),
          data: areaList,
        },
        true
      );
    } catch (error) {
      const errorMessage = "Error In Getting the Area List";
      console.log("errorMessage error line ------ 289", errorMessage);
      logger.error(`\n\n ${errorMessage} \n\n`, error);
      return encrypt(
        {
          success: false,
          message: errorMessage,
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }

  public async filteredAreaListV1(
    user_data: any,
    tokendata?: any
  ): Promise<any> {
    const token = { id: tokendata.id, cash: tokendata.cash };

    try {
      const areaList = await executeQuery(filteredArea, [
        user_data.pinCode,
        user_data.cityName,
      ]);
      return encrypt(
        {
          success: true,
          message: "Filtered Area List Passed Successfully",
          token: generateTokenWithoutExpire(token, true),
          data: areaList,
        },
        true
      );
    } catch (error) {
      const errorMessage = "Error In Passing the Filtered the Area ";
      console.log("errorMessage error line ------ 376", errorMessage);
      logger.error(`\n\n ${errorMessage} \n\n`, error);
      return encrypt(
        {
          success: false,
          message: errorMessage,
          token: generateTokenWithoutExpire(token, true),
        },
        true
      );
    }
  }
}
