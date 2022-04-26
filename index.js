import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { authUser } from "./middleware/authUser.js";
import uploadPost from "./dbCred/uploadPost.js";
import followRoute from "./routes/follow_route.js";
import commentRoute from "./routes/add_comment.js";
import userReaction from "./routes/updown.js";
import amqplib from "amqplib";
import "dotenv/config";

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());

console.log(process.env.MYKEY);

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(authUser);

app.use(userReaction);
app.use(followRoute);
app.use(commentRoute);

app.get("*", (req, resp) => {
  if (req.method == "GET") {
    resp.status(405).end();
    return;
  }
});

app
  .post("/", (req, resp) => {
    let { title, discussion, has_media } = req.body;
    const { us_id } = req.cookies;

    const data = uploadPost(us_id, title, discussion, has_media)
      .then((e) => {
        resp.status(200).json({ success: true });
      })
      .catch((e) => {
        console.log(e);
        resp.status(200).json({ success: false });
      });
  })
  .listen(8000);
