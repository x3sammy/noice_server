import crypto from "crypto";
const encrypt = (text) => {
  const ENC = process.env.SESSION_ENC_KEY;
  const IV = "65f95neck5dm6eww";
  const ALGO = "aes128";
  let cipher = crypto.createCipheriv(ALGO, ENC, IV);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
};

export default encrypt;
