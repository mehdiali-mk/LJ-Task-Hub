import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN; // Can be Auth Token or API Key Secret
const apiKey = process.env.TWILIO_API_KEY;
const apiSecret = process.env.TWILIO_API_SECRET;
const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let client;

try {
  if (apiKey && apiSecret && accountSid) {
    client = twilio(apiKey, apiSecret, { accountSid });
  } else if (accountSid && authToken) {
      client = twilio(accountSid, authToken);
  } else {
      console.warn("Twilio credentials missing. SMS/WhatsApp will not work.");
  }
} catch (error) {
  console.error("Error initializing Twilio client:", error);
}

export const sendSms = async (to, body) => {
  if (!client) return false;

  try {
    await client.messages.create({
      body,
      from: fromPhoneNumber,
      to,
    });
    console.log(`SMS sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
};

export const sendWhatsapp = async (to, body) => {
    if (!client) return false;
  
    try {
      await client.messages.create({
        body,
        from: `whatsapp:${fromPhoneNumber}`,
        to: `whatsapp:${to}`,
      });
      console.log(`WhatsApp sent to ${to}`);
      return true;
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
      return false;
    }
  };
