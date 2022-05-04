import express from "express";
const signupRoute = express.Router();
import bcrypt from "bcrypt";
import conn from "../connect/connect.js";
import amqplib from "amqplib";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "redis";
const uid = uuidv4();

var errVal = 0;

const client = createClient({
  url: "redis://127.0.0.1:6379",
});

client.connect(console.log("connected..."));

client.on("error", function (err) {
  if (errVal == 0) {
    console.error("[x] Redis server failed connected");
    errVal += 1;
  }
});

const fwQ = async () => {
  errVal = 1;
  const connection = await amqplib.connect("amqp://localhost");
  return connection;
};

const checkName = async (a, b) => {
  const reg = /^[a-zA-z\s]+$/;
  if (
    a.search(reg) == 0 ||
    b.length < 5 ||
    b.length > 30 ||
    a.length < 5 ||
    a.length > 30
  ) {
    return true;
  } else {
    return false;
  }
};

signupRoute.post("/signup", (req, resp) => {
  let { otp, phone } = req.body;
  const checkUserCred = new Promise((resolve, reject) => {
    (async () => {
      const chk = await client.get(phone);
      if (chk == null) {
        reject({
          success: false,
          msg: "OTP Expired or Not Exist",
        });
      } else {
        const getData = JSON.parse(chk);
        const { data, userData } = getData;

        if (getData.otp != otp) {
          reject({ success: false, msg: "Incorrect OTP, Try Again!" });
        } else {
          resolve({ data, userData });
          client.del(phone);
        }
      }
    })();
  });

  checkUserCred
    .then((e) => {
      const { data, userData } = e;

      const username = userData.username;
      const name = userData.name;
      const password = userData.password;

      const rawPhone = data.rawPhone;
      const country = data.country;

      delete data.rawPhone;
      delete data.country;

      const mainData = JSON.stringify(data);

      // console.log(userData);

      // resp.status(200).json({ success: false });
      // return false;

      if (checkName(name, password) == false) {
        resp.status(200).json({ success: false });
        return false;
      }

      (async () => {
        const check = new Promise((reslove, reject) => {
          fwQ()
            .then((e) => {
              const qname = "signup_queue";
              (async () => {
                const genSalt = await bcrypt.genSalt(5);
                const pass_hash = await bcrypt.hash(password, genSalt);

                const channel = await e.createChannel();
                const temp_queue = await channel.assertQueue("", {
                  exclusive: true,
                });
                await channel.assertQueue(qname, { durable: true });
                const data = JSON.stringify({
                  user: {
                    username: username,
                    name: name,
                    password: pass_hash,
                    location: country,
                    country_data: mainData,
                  },
                  phone: rawPhone,
                });

                channel.sendToQueue(qname, Buffer.from(data), {
                  replyTo: temp_queue.queue,
                  correlationId: uid,
                });

                channel.consume(
                  temp_queue.queue,
                  (msg) => {
                    if (msg.properties.correlationId == uid) {
                      const data = msg.content.toString();
                      console.log(data);
                      if (data == 1) {
                        reslove();
                      } else {
                        reject();
                      }
                      (async () => {
                        channel.ack(msg);
                        await channel.close();
                        await e.close();
                      })();
                    }
                  },
                  {
                    noAck: true,
                  }
                );
              })();
            })
            .catch((e) => {
              reject();
            });
        })
          .then((e) => {
            setTimeout(() => {
              resp.status(200).json({ success: "ok" });
            }, 2000);
          })
          .catch((e) => {
            resp.json({ sucess: false, msg: "something went wrong" });
          });
      })();
    })
    .catch((e) => {
      console.log(e);
      resp.status(200).json({ success: false, msg: e.msg });
    });
});

export default signupRoute;
