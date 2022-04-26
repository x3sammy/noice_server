import express, { response } from "express";
import testRouter from "./test_route.js";

const app = express();

console.clear();

app.use(testRouter);

app
  .get("/", (req, res) => {
    res.json({ success: 1 });
  })
  .listen(8000);
