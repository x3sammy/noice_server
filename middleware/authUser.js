import crypto from "crypto";
import conn from "../connect/connect.js";
import decrypt from "../lib/decrypt.js";
import encrypt from "../lib/encrypt.js";

export const authUser = async (req, resp, next) => {
  if (req.url == "/signup" || req.url == "/login" || req.url == "/sendOtp") {
    next();
  } else {
    const { __ut, us_id, s_king } = req.cookies;

    if (__ut == undefined || us_id == undefined || s_king == undefined) {
      resp.status(405).end();
      return;
    }

    const verify = decrypt(s_king);
    if (verify.invalid == true) {
      resp.status(405).end();
      return;
    }

    if (verify.expired == true) {
      const { id, token } = verify;
      if (id != us_id && token != __ut) {
        resp.status(405).end();
        return;
      }
      var targetDate = new Date();
      const exp = targetDate.setDate(targetDate.getDate() + 1);
      const serverSessionEnc = id + ";" + token + ";" + exp;
      const enc = encrypt(serverSessionEnc);

      resp.cookie("s_king", enc, {
        maxAge: 1000 * 60 * 60 * 60 * 60 * 24,
        httpOnly: true,
      });
      next();
    }

    if (verify.expired == false) {
      const { id, token } = verify;

      if (id != us_id || token != __ut) {
        resp.cookie("s_king", "", {
          maxAge: -3600,
          httpOnly: true,
        });
        resp.cookie("__ut", "", {
          maxAge: -3600,
          httpOnly: true,
        });
        resp.cookie("s_knight", "", {
          maxAge: -3600,
          httpOnly: true,
        });
        resp.status(405).end();
        return;
      } else {
        next();
      }
    }
  }
};
