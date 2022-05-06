import { createPool } from "mysql";

const conn = createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "#Hellow90",
  database: "noicefeed",
});

// conn.connect((e) => {
//   if (e) {
//     console.log("[x] Database Failed To Connect\r\n");
//   } else {
//     console.log("[+] MySql Database Connected\n\r");
//   }
// });

export default conn;
