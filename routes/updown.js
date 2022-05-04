import express from "express";
import amqplib from "amqplib";
import { v4 as uuidv4 } from "uuid";
import conn from "../connect/connect.js";
const userReaction = express.Router();
const uid = uuidv4();

const fwQ = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  return connection;
};

userReaction.post("/:owner/:post_id/reaction/:reaction", (req, resp) => {
  try {
    const { owner, post_id, reaction } = req.params;
    if (
      reaction != "upvote" &&
      reaction != "downvote" &&
      reaction != "remove_vote"
    ) {
      resp.status(405).end();
    }

    var react;

    if (reaction == "upvote") {
      react = 1;
    }

    if (reaction == "downvote") {
      react = 2;
    }

    const { us_id } = req.cookies;
    const postId_check = post_id.search(/^[0-9]{1,15}$/);
    if (postId_check == 0) {
      fwQ().then((e) => {
        (async () => {
          const qname = "post_" + reaction;
          const channel = await e.createChannel();
          const feedback = await channel.assertQueue("", { exclusive: true });

          if (reaction == "upvote" || reaction == "downvote") {
            await channel.assertQueue(qname, { durable: false });
            channel.sendToQueue(
              qname,
              Buffer.from(
                JSON.stringify({
                  username: owner,
                  post_id: post_id,
                  user_id: us_id,
                  reaction: react,
                })
              ),
              {
                replyTo: feedback.queue,
                correlationId: uid,
              }
            );
          }

          if (reaction == "remove_vote") {
            (async () => {
              const removePostVote = "remove_post_vote";
              await channel.assertQueue(removePostVote, { durable: false });
              channel.sendToQueue(
                removePostVote,
                Buffer.from(
                  JSON.stringify({
                    username: owner,
                    post_id: post_id,
                    user_id: us_id,
                    reaction: react,
                  })
                ),
                {
                  replyTo: feedback.queue,
                  correlationId: uid,
                }
              );
            })();
          }

          channel.consume(
            feedback.queue,
            (msg) => {
              if (msg.properties.correlationId == uid) {
                const data = msg.content.toString();
                if (data == "1") {
                  resp.status(200).json({ success: "ok" });
                } else {
                  resp.status(200).json({ success: false });
                }
                channel.ack(msg);
                (async () => {
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
      });
    } else {
      resp.status(405).end();
    }
  } catch (e) {
    resp.status(405).end();
  }
});
export default userReaction;
