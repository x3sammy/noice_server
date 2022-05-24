import express from "express";
const CoverUpload = express.Router();
import fetch from "node-fetch";
import conn from "../connect/connect.js";

CoverUpload.post("/:username/coverUpload", (req, resp) => {
  const { username } = req.params;
  const { us_id } = req.cookies;
  const { cover_img } = req.body;

  if (cover_img != "") {
    (async () => {
      try {
        const res = await fetch(
          "https://qok65ezpcmdsxgqpznrroaqfoy0zhwav.lambda-url.ap-south-1.on.aws?q=" +
            cover_img
        );
        if (res.status == 200) {
          let ff = await res.json();
          delete ff.success;
          ff = JSON.stringify(ff);
          conn.query(
            "UPDATE profile SET cover_img = ? WHERE id = ? AND username = ?",
            [ff, us_id, username]
          );
          resp.status(200).json({ success: "ok" });
        } else {
          resp.json({ success: false });
        }
      } catch (e) {
        console.log("err1", e.message);
        resp.status(405).end();
      }
    })();
  } else {
    console.log("err2", e.message);
    resp.status(405).end();
  }
});

export default CoverUpload;
