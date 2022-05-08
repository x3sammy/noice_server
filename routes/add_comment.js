import express from "express";
const commentRoute = express.Router();
import conn from "../connect/connect.js";
import checkId from "../codes/checkId.js";

commentRoute.post("/:username/:post_id/:user_id/comment", (req, resp) => {
  const { username, user_id, post_id } = req.params;
  const { data } = req.body;
  var lastId;
  try {
    if (checkId(user_id) && checkId(post_id)) {
      const main = new Promise((resolve, reject) => {
        conn.getConnection((err, conn) => {
          conn.query(
            `SELECT EXISTS(SELECT id FROM post WHERE id = ? AND owner_id = (SELECT id FROM profile WHERE username = ?)) AS is_exist`,
            [post_id, username],
            (err, result) => {
              if (err) {
                console.log(err.message);
                reject({ success: false });
              } else {
                const res = JSON.parse(JSON.stringify(result))[0];
                if (res.is_exist == 0) {
                  reject({ msg: "not allowed" });
                } else {
                  conn.beginTransaction((err) => {
                    if (err) {
                      conn.rollback();
                      reject({ success: false });
                    } else {
                      conn.query(
                        `INSERT INTO post_comments(post_id, user_id, comment)
                    VALUES(?, ?, ?)`,
                        [post_id, user_id, data],
                        (err, result) => {
                          lastId = result.insertId;
                          if (err) {
                            conn.rollback();
                            reject({ msg: "something went wrong" });
                          } else {
                            conn.query(
                              `UPDATE post SET comments = comments+1 WHERE id = ? AND owner_id = (SELECT id FROM profile WHERE username = ?)`,
                              [post_id, username],
                              (err, result) => {
                                if (err) {
                                  conn.rollback();
                                  reject({ msg: "failed to update" });
                                } else {
                                  conn.commit();
                                  resolve({ success: true, id: lastId });
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  });
                }
              }
            }
          );
        });
      })
        .then((e) => {
          setTimeout(() => {
            resp.status(200).json({ success: true, id: lastId });
          }, 2000);
        })
        .catch((e) => {
          resp.status(401).json({ success: false, msg: e.msg });
        });
    } else {
      resp.status(401).json({ success: false });
      return false;
    }
  } catch (e) {
    console.log(e.message);
    resp.status(200).json({ success: false });
  }
});

export default commentRoute;
