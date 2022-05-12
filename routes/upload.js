import express, { Router } from "express";
import Randomstring from "randomstring";
import AWS from "aws-sdk";
const GetUrl = express.Router();
import "dotenv/config";

const s3 = new AWS.S3({
  accessKeyId: process.env.UPLOAD_IMG_ID,
  secretAccessKey: process.env.UPLOAD_IMG_KEY,
  region: "ap-south-1",
});

GetUrl.post("/getSignedUrl", (req, resp) => {
  try {
    const img_id = Randomstring.generate(12);
    s3.getSignedUrl(
      "putObject",
      {
        Bucket: "upload-temp-img",
        Key: img_id + ".jpg",
        ContentType: "image/jpeg",
      },
      (err, url) => {
        if (err) {
          resp.json({ success: false });
        } else {
          resp.json({ success: true, url: url, id: img_id });
          return;
        }
      }
    );
  } catch (e) {
    console.log(e.message);
  }
});

export default GetUrl;
