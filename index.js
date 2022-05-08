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
import "dotenv/config";
import conn from "./connect/connect.js";
import escape from "escape-html";

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

app.get("*", (req, resp) => {
  if (req.method == "GET") {
    resp.status(405).end();
    return;
  }
});

app
  .post("/", (req, resp) => {
    try {
      let { title, discussion, has_media } = req.body;
      const { __ut, us_id } = req.cookies;

      title = conn
        .escape(title)
        .trim()
        .substring(0, 32)
        .replace(/\W+/g, "")
        .replace(/_$/, "");
      discussion = escape(
        discussion.trim().substring(0, 300).replaceAll(/\n+/g, "\n")
      );
      //resp.status(200).json({ success: true, msg: discussion });

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
    } catch (e) {
      console.log(e.message);
      resp.json({ success: false });
    }
  })
  .listen(8000);
