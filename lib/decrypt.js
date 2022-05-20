import crypto from "crypto";

const decrypt = (text) => {
  const ENC = process.env.SESSION_ENC_KEY;
  const IV = "65f95neck5dm6eww";
  const ALGO = "aes128";
  try {
    let decipher = crypto.createDecipheriv(ALGO, ENC, IV);
    let decrypted = decipher.update(decodeURIComponent(text), "base64", "utf8");
    let finalDec = (decrypted + decipher.final("utf8")).split(";");

    let exp = finalDec[2];
    const date = new Date().getTime();

    if (date > exp) {
      return {
        expired: true,
        id: finalDec[0],
        token: finalDec[1],
      };
    } else {
      return {
        expired: false,
        id: finalDec[0],
        token: finalDec[1],
      };
    }
  } catch (e) {
    console.log(e.message);
    return {
      invalid: true,
    };
  }
};

export default decrypt;
