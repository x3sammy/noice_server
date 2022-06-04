import express from "express";
const sendOtp = express.Router();
import PhoneNumberUtil from "google-libphonenumber";
import { createClient } from "redis";
import countryCode from "../codes/countryCode.js";
import conn from "../connect/connect.js";

const client = createClient({
  url: "redis://localhost",
});

client.connect();

const phoneUtils = PhoneNumberUtil.PhoneNumberUtil.getInstance();

try {
  const checkExist = (a, b, c) => {
    if (a == "" || b == "" || c == "") {
      return false;
    } else {
      return true;
    }
  };

  const validatPhone = (a) => {
    const phoneNumber = "+" + a;
    try {
      const number = phoneUtils.parseAndKeepRawInput(phoneNumber);
      const cc = phoneUtils.getRegionCodeForNumber(number);
      if (phoneUtils.isValidNumber(number)) {
        return {
          success: true,
          data: {
            rawPhone: number.getNationalNumber(),
            country: countryCode()[cc].name,
            countryRegion: phoneUtils.getRegionCodeForNumber(number),
            countryCode: number.getCountryCode(),
          },
        };
      } else {
        return {
          success: false,
        };
      }
    } catch (e) {
      console.log(e.message);
      return {
        success: false,
        msg: e.message,
      };
    }
  };

  sendOtp.post("/sendOtp", (req, resp) => {
    const { user, phone } = req.body;
    const { username, name, password } = user;

    const checkPhone = validatPhone(phone);
    if (checkPhone.success) {
      if (checkExist(username, phone)) {
        const rawPhone = checkPhone.data.rawPhone;
        (async () => {
          const checkUsernamePhone = new Promise((resolve, reject) => {
            conn.query(
              "SELECT EXISTS(SELECT id FROM profile WHERE username=? OR phone=? LIMIT 1) AS exist ",
              [username, rawPhone],
              (err, result) => {
                if (err) {
                  resolve("err");
                } else {
                  const data = JSON.parse(JSON.stringify(result))[0];
                  console.log(data);
                  if (data.exist) {
                    resolve("err");
                  } else {
                    resolve("ok");
                  }
                }
              }
            );
          });

          const isDataValid = await checkUsernamePhone;

          if (isDataValid != "ok") {
            resp.json({ success: false, msg: "Phone Number Already Exist" });
            return;
          }

          const rand = Math.floor(Math.random() * 90000) + 10000;
          const res = await client.exists(rawPhone);
          if (res) {
            resp.json({ success: false, msg: "asnt" });
          } else {
            client.setEx(
              rawPhone,
              60 * 5,
              JSON.stringify({
                data: checkPhone.data,
                otp: rand,
                userData: user,
              })
            );
            console.log(rand);
            resp.status(200).json({ success: "ok", msg: "otp sent" });
          }
        })();
      } else {
        resp.json({ success: false });
      }
    } else {
      resp.json({ success: false });
    }
  });
} catch (e) {
  console.log(e.message);
  console.log("there was an err");
}
export default sendOtp;
