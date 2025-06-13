import { encrypt } from "../../helper/encrypt";
import { generateTokenWithoutExpire } from "../../helper/token";
import axios from "axios";
import qs from "qs";
import { Client } from "@microsoft/microsoft-graph-client";
require("isomorphic-fetch");

const tenantId = "91a31033-80f3-4db6-8805-3e556a1e4995";
const clientId = "80177c7c-49df-4a2e-8725-231c18ea2268";
const clientSecret = "bcc81305-60b0-4494-8871-d7a9fa6700f5";

// ------------------ Get Access Token ------------------
async function getAccessToken(): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const data = qs.stringify({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "https://graph.microsoft.com/.default",
  });

  try {
    const response = await axios.post(tokenUrl, data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data.access_token;
  } catch (error: any) {
    console.error("Access Token Error:", error.response?.data || error.message);
    throw new Error("Failed to get access token");
  }
}

// ------------------ Send Email ------------------
async function sendMail(accessToken: string): Promise<void> {
  const client = Client.init({
    authProvider: (done) => done(null, accessToken),
  });

  try {
    await client.api("/users/YOUR_EMAIL@domain.com/sendMail").post({
      message: {
        subject: "Test Email",
        body: {
          contentType: "Text",
          content:
            "This is a test email sent using Microsoft Graph API + OAuth2.",
        },
        toRecipients: [
          {
            emailAddress: { address: "recipient@example.com" },
          },
        ],
      },
      saveToSentItems: true,
    });
  } catch (error: any) {
    console.error("SendMail Error:", error?.body || error?.message || error);
    throw new Error("Failed to send email");
  }
}

// ------------------ Repository Class ------------------
export class testingRepository {
  public async mailV1(user_data: any, tokendata?: any): Promise<any> {
    const token = { id: tokendata?.id, cash: tokendata?.cash };

    try {
      const accessToken = await getAccessToken();
      await sendMail(accessToken);

      return encrypt(
        {
          success: true,
          message: "Email sent successfully",
          token: generateTokenWithoutExpire(token, true),
        },
        false
      );
    } catch (error) {
      console.error("Error in mailV1:", error);

      return encrypt(
        {
          success: false,
          message: "Error sending email",
          token: generateTokenWithoutExpire(token, true),
        },
        false
      );
    }
  }
}
