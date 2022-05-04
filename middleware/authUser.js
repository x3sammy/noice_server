import conn from "../connect/connect.js";
import { createClient } from "redis";

const client = createClient({
  url: "redis://localhost:6379",
});

client.on("error", (err) => {
  console.log(err.message);
});

client.connect(console.log("server connected to redis"));

export const authUser = async (req, resp, next) => {
  if (req.url == "/signup" || req.url == "/login" || req.url == "/sendOtp") {
    next();
  } else {
    const { __ut, us_id, __st } = req.cookies;

    if (__ut == undefined || us_id == undefined) {
      resp.status(405).end();
      return;
    }

    const keyTemp = __st + us_id;
    const keyMain = __ut + us_id;
    const getUserViaSt = await client.exists(keyTemp);

    if (getUserViaSt == 0) {
      const getUserMain = await client.exists(keyMain);
      if (getUserMain == 0) {
        resp.status(401).end();
      } else {
        next();
      }
    } else {
      next();
    }
  }
};
