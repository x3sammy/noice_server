import amqplib from "amqplib";
import { v4 as uuidv4 } from "uuid";

const data = process.argv.slice(2);
const msg = data[0];
const type = data[1];
const uid = uuidv4();

if (data[0] == undefined && data[1] == undefined) {
  console.log("[x] Err : invalid parameters");
  process.exit(1);
}

if (type != "follow" && type != "unfollow") {
  console.log("[x]Invalid Type");
  process.exit(1);
}

const sendQ = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange("rpc_testing", "direct", { durable: true });

  const que = await channel.assertQueue("", { exclusive: true, durable: true });

  channel.publish("rpc_testing", type, Buffer.from(msg), {
    replyTo: que.queue,
    correlationId: uid,
  });

  console.log("[+]Published To :", que.queue);
  console.log("[-]Waiting fro response");
  channel.consume(que.queue, (msg) => {
    console.log("[~] Msg Recv :", msg.content.toString());
    channel.ack(msg);
    setTimeout(() => {
      connection.close();
    }, 500);
  });
};

sendQ();
