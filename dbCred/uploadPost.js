import conn from "../connect/connect.js";
import { createHash } from "crypto";
console.clear();

var getSha = function (input) {
  return createHash("sha1").update(JSON.stringify(input)).digest("hex");
};

const uploadPost = async (owner_id, title, discussion, has_media) => {
  try {
    const getData = new Promise((resolve, reject) => {
      conn.beginTransaction((err) => {
        if (err) {
          reject("err 1.1");
          conn.rollback("err");
        } else {
          conn.query(
            `INSERT INTO 
              posts
                (owner_id, post_hash, upvotes, downvotes, comments, hooked, has_media)
              VALUES
                (?, ?, 0, 0, 0, 0, ?)
            `,
            [
              owner_id,
              getSha(title + "_noice_").substring(0, 12),
              has_media == true ? 1 : 0,
            ],
            (error, result) => {
              if (error) {
                console.log(error.message);
                conn.rollback();
                reject("err 1.2");
              } else {
                conn.query(
                  `INSERT INTO post_full(post_id, title, discussion) VALUES(?, ?, ?)`,
                  [result.insertId, title, discussion],
                  (err, result) => {
                    if (err) {
                      conn.rollback();
                      reject("err 1.3");
                    } else {
                      conn.commit();
                      resolve(result);
                    }
                  }
                );
              }
            }
          );
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
