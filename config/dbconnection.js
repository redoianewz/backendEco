const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST  ||  'localhost',
  user: process.env.DB_USERNAME  ||  'root',
  password: process.env.DB_PASSWORD  ||  '',
  database: process.env.DB_DBNAME   ||  'ecommerce_express_nextjs' ,
});

pool.getConnection((err, conn) => {
  if (err) console.log(err);
  console.log("Connected successfully");
  if (conn) conn.release();
});

module.exports = pool.promise();


