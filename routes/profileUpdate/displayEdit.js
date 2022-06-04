import express from "express";
const DisplayEdit = express.Router();
import connectRabbit from "../../lib/connectRabbit.js";
import escape from "escape-html";
import { v4 as uuidv4 } from "uuid";
import e from "express";

function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    value
  );
}

function validateAddress(val) {
  const reg = /^[a-zA-Z0-9\s,'-]*$/;
  if (val.search == 0) {
    return true;
  } else {
    return false;
  }
}

const uid = uuidv4();

DisplayEdit.post("/:username/displayEdit", (req, resp) => {
  const { username } = req.params;
  const { us_id } = req.cookies;

  const data = req.body;
  let { bio, link, location } = data;

  if (
    data["bio"] == undefined ||
    data["link"] == undefined ||
    data["location"] == undefined
  ) {
    resp.status(405).end();
    return;
  }

  // ---------------------- link verification start ----------------------

  if (link != "") {
    if (!validateUrl(link) || link.length > 500) {
      resp.status(200).json({ success: false, msg: "invalid link" });
      return;
    }
  }

  const final_link =
    link == ""
      ? null
      : {
          display_url: link.replace(/(https|http):\/\/(www\.)?/, ""),
          main_url: link,
        };

  // ------------------------------------------

  if (!validateAddress(location)) {
    location = location.replace(/[~!@#$%^&*()_+|":{}\[\]\\\/\r\n]/g, "");
  }

  const saitizedData = {
    userId: us_id,
    username: username,
    bio: escape(
      bio
        .substr(0, 100)
        .trim()
        .replace(/\n{2,}/g, "\n")
    ),
    link: final_link,
    location: escape(location.substr(0, 30).trim()),
  };

  const updateProfile = new Promise((resolve, reject) => {
    if (connectRabbit() == "err") {
      reject();
    } else {
      (async () => {
        try {
          const connection = await connectRabbit();
          const channel = await connection.createChannel();
          await channel.assertQueue("editProfileDisplay", { durable: false });
          const recvQ = await channel.assertQueue("", { exclusive: true });
          channel.sendToQueue(
            "editProfileDisplay",
            Buffer.from(JSON.stringify(saitizedData).toString()),
            {
              replyTo: recvQ.queue,
              correlationId: uid,
            }
          );

          channel.consume(
            recvQ.queue,
            (msg) => {
              if (msg.content) {
                if (msg.properties.correlationId == uid) {
                  const fd = msg.content.toString();
                  if (fd == "1") {
                    resolve(1);
                  } else {
                    resolve(0);
                  }
                  setTimeout(() => {
                    (async () => {
                      await channel.close();
                      await connection.close();
                    })();
                  }, 500);
                }
              }
            },
            {
              noAck: true,
            }
          );
        } catch (e) {
          reject("error");
        }
      })();
    }
  });

  updateProfile
    .then((e) => {
      if (e == 1) {
        resp.status(200).json({ success: "ok" });
      } else {
        resp.status(200).json({ success: false, msg: "failed to update" });
      }
    })
    .catch((e) => {
      resp.status(200).json({ success: false });
    });
});

export default DisplayEdit;
