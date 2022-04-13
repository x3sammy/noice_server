import mysql from "mysql";

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "#Hellow90",
  database: "noicefeed",
});

conn.connect((e) => {
  if (e) {
    console.log(e.sqlMessage);
  } else {
    console.log("database connected...");
  }
});

export default conn;
