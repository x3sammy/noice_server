import express from "express";
const followRoute = express.Router();
import conn from "../connect/connect.js";

followRoute.post("/:id/follow", (req, resp) => {
  try {
    const { id } = req.params;
    const { us_id } = req.cookies;
    const is_valid = id.search(/^[0-9]{1,13}$/);
    if (is_valid == 0) {
      const follow = new Promise((resolve, reject) => {
        conn.beginTransaction((err) => {
          if (err) {
            console.log("err.1");
            conn.rollback();
            conn.end();
          } else {
            conn.query(
              `INSERT INTO followers(user_id, following_id) VALUES(?, ?)`,
              [us_id, id],
              (err1, result1) => {
                if (err) {
                  console.log("err 1.2");
                  conn.rollback();
                  conn.end();
                  reject(err1.message);
                } else {
                  conn.query(
                    `UPDATE followers_exact as t1, followers_exact as t2 SET

                        t1.followers = t1.followers + 1,
                        t2.following = t2.following + 1 
                        
                        where t1.owner_id = ? AND 
                        t2.owner_id = ? `,

                    [id, us_id],
                    (err2, result2) => {
                      if (err2) {
                        console.log(err2.message);
                        conn.rollback();
                        conn.end();
                        reject(err2.message);
                      } else {
                        conn.commit();
                        resolve({ success: true });
                      }
                    }
                  );
                }
              }
            );
          }
        });
      });
      follow
        .then((e) => {
          setTimeout(() => {
            resp.status(200).json({ success: "ok" });
          }, 2000);
        })
        .catch((e) => {
          resp
            .status(200)
            .json({ success: false, err: "failed to follow user" });
        });
    } else {
      resp.status(405).end();
    }
  } catch (e) {
    console.log(e.message);
    resp.status(500).json({ success: false });
  }
});

followRoute.post("/:id/unfollow", (req, resp) => {
  try {
    const { id } = req.params;
    const { us_id } = req.cookies;
    const is_valid = id.search(/^[0-9]{1,13}$/);
    if (is_valid == 0) {
      const follow = new Promise((resolve, reject) => {
        conn.beginTransaction((err) => {
          if (err) {
            console.log("err.1");
            conn.rollback();
            conn.end();
          } else {
            conn.query(
              `DELETE FROM followers WHERE user_id = ? AND following_id = ?`,
              [us_id, id],
              (err1, result1) => {
                if (err) {
                  console.log("err 1.2");
                  conn.rollback();
                  conn.end();
                  reject(err1.message);
                } else {
                  conn.query(
                    `UPDATE followers_exact as t1, followers_exact as t2 SET

                        t1.followers = t1.followers - 1,
                        t2.following = t2.following - 1 
                        
                        where t1.owner_id = ? AND 
                        t2.owner_id = ? `,
                    [id, us_id],
                    (err2, result2) => {
                      if (err2) {
                        console.log(err2.message);
                        conn.rollback();
                        conn.end();
                        reject(err2.message);
                      } else {
                        conn.commit();
                        resolve({ success: true });
                      }
                    }
                  );
                }
              }
            );
          }
        });
      });
      follow
        .then((e) => {
          setTimeout(() => {
            resp.status(200).json({ success: "ok" });
          }, 2000);
        })
        .catch((e) => {
          resp
            .status(200)
            .json({ success: false, err: "failed to unfollow user" });
        });
    } else {
      resp.status(405).end();
    }
  } catch (e) {
    console.log(e.message);
    resp.status(500).json({ success: false });
  }
});

export default followRoute;
