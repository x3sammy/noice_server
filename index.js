import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { authUser } from "./middleware/authUser.js";
import uploadPost from "./dbCred/uploadPost.js";
import followRoute from "./routes/follow_route.js";
import commentRoute from "./routes/add_comment.js";
import userReaction from "./routes/updown.js";
import signupRoute from "./routes/signup.js";
import sendOtp from "./routes/sendOtp.js";
import GetUrl from "./routes/upload.js";
import DisplayEdit from "./routes/profileUpdate/displayEdit.js";

import "dotenv/config";
import conn from "./connect/connect.js";
import escape from "escape-html";
import fetch from "node-fetch";
import decrypt from "./lib/decrypt.js";

console.clear();

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(authUser);
app.use(signupRoute);
app.use(userReaction);
app.use(followRoute);
app.use(commentRoute);
app.use(sendOtp);
app.use(GetUrl);
app.use(DisplayEdit);

app.get("*", (req, resp) => {
  if (req.method == "GET") {
    resp.status(405).end();
    return;
  }
});

app
  .post("/", (req, resp) => {
    try {
      let { title, discussion, has_media, img_id } = req.body;
      const { __ut, us_id } = req.cookies;
      title = conn
        .escape(title)
        .trim()
        .substring(0, 32)
        .replace(/\W+/g, "")
        .replace(/_$/, "");
      discussion = escape(
        discussion
          .trim()
          .substring(0, 300)
          .replace(/\n{3,}/g, "\n\n")
      );

      if (has_media) {
        (async () => {
          try {
            const re = await fetch(
              "https://vaptvqmckh3swz7f4chvhj3caq0xvpxo.lambda-url.ap-south-1.on.aws?q=" +
                img_id
            );

            let ff = await re.json();
            if (ff.success) {
              delete ff.success;
              ff = JSON.stringify(ff);

              const data = uploadPost(us_id, title, discussion, has_media, ff)
                .then((e) => {
                  const data = e;
                  const id = e[0];
                  const hash = e[1];
                  resp.status(200).json({
                    success: "ok",
                    id: id,
                    hash: hash,
                    imgData: ff,
                  });
                })
                .catch((e) => {
                  console.log(e);
                  resp.status(200).json({ success: false });
                });
            }
          } catch (e) {
            console.log(e.message);
            resp.status(500).json({ success: false });
            return;
          }
        })();
      } else {
        const data = uploadPost(us_id, title, discussion, has_media)
          .then((e) => {
            const data = e;
            const id = e[0];
            const hash = e[1];
            resp.status(200).json({ success: "ok", id: id, hash: hash });
          })
          .catch((e) => {
            console.log(e);
            resp.status(200).json({ success: false });
          });
      }
    } catch (e) {
      console.log(e.message);
      resp.json({ success: false });
    }
  })
  .listen(8000);

process
  .on("unhandledRejection", (reason, p) => {
    console.error(reason);
    process.exit(1);
  })
  .on("uncaughtException", (err) => {
    console.error(err, "Uncaught Exception thrown");
    process.exit(1);
  });
