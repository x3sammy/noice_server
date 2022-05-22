import connectRabbit from "../lib/connectRabbit.js";

const recvQ = async () => {
  const connection = await connectRabbit();
  const channel = await connection.createChannel();

  await channel.assertQueue("editProfileDisplay", { durable: false });

  channel.consume(
    "editProfileDisplay",
    (msg) => {
      if (msg.content) {
        const replyData = msg.properties;
        const replyTo = replyData.replyTo;
        const coId = replyData.correlationId;
        console.log(msg.content.toString());
        channel.sendToQueue(replyTo, Buffer.from("1"), {
          correlationId: coId,
        });
      }
    },
    {
      noAck: true,
    }
  );
};

recvQ();
