import express from "express";
const ProfileImgs = express.Router();
import fetch from "node-fetch";
import conn from "../connect/connect.js";

ProfileImgs.post("/:username/coverUpload", (req, resp) => {
  console.log("y");
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
            "UPDATE profile SET cover_img = ? WHERE id = ? AND username = ? LIMIT 1",
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

ProfileImgs.post("/:username/profileImgUpload", (req, resp) => {
  const { username } = req.params;
  const { us_id } = req.cookies;
  const { profile_img_id } = req.body;

  if (profile_img_id != "") {
    (async () => {
      try {
        const res = await fetch(
          "https://zfxenngtr3r5ikju3kuyq3v2oa0iypyh.lambda-url.ap-south-1.on.aws?q=" +
            profile_img_id
        );
        if (res.status == 200) {
          let ff = await res.json();
          if (ff.success) {
            delete ff.success;
            ff = JSON.stringify(ff);
            conn.query(
              "UPDATE profile SET profile_img = ? WHERE id = ? AND username = ? LIMIT 1",
              [ff, us_id, username]
            );
            resp.cookie("user", "", {
              maxAge: -3600,
            });
            resp.status(200).json({ success: "ok" });
          } else {
            resp.json({ success: false });
          }
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

export default ProfileImgs;
