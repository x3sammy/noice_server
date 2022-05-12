import conn from "../connect/connect.js";
import { createHash } from "crypto";
console.clear();

var getSha = function (input) {
  return createHash("sha1").update(JSON.stringify(input)).digest("hex");
};

const uploadPost = async (owner_id, title, discussion, has_media, url) => {
  has_media ? "" : (url = null);

  try {
    const getData = new Promise((resolve, reject) => {
      conn.getConnection((err, conn) => {
        try {
          if (err) {
            reject("[x] Database Connection Failed");
          } else {
            conn.beginTransaction((err) => {
              if (err) {
                reject("err 1.1");
                conn.rollback("err");
              } else {
                const post_hash = getSha(title + "_noice_").substring(0, 12);
                conn.query(
                  `INSERT INTO 
                    post
                      (owner_id, post_hash, has_media, media_url)
                    VALUES (?, ?, ?, ?)
                `,
                  [owner_id, post_hash, has_media == true ? 1 : 0, url],
                  (error, result) => {
                    if (error) {
                      console.log(error.message);
                      conn.rollback();
                      reject("err 1.2");
                    } else {
                      const insertId = result.insertId;
                      conn.query(
                        `INSERT INTO post_full(post_id, title, discussion) VALUES(?, ?, ?)`,
                        [insertId, title, discussion],
                        (err, result) => {
                          if (err) {
                            conn.rollback();
                            reject("err 1.3");
                          } else {
                            conn.commit();
                            resolve([insertId, post_hash]);
                          }
                        }
                      );
                    }
                  }
                );
              }
            });
          }
        } finally {
          conn.release();
        }
      });
    });
    return getData;
  } catch (e) {
    console.log("there was an errurrr", e.message);
    return false;
  }
};

export default uploadPost;
