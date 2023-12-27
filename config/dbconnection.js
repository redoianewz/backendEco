// Desc: Database connection
const mysql = require('mysql2')

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'bed9h5amw0w6whhfx3il-mysql.services.clever-cloud.com',
    user: process.env.DB_USERNAME || 'ungtg7jukpabo0qs',
    password: process.env.DB_PASSWORD || 'eA2AjVBz53BmTGEEaKEV',
    database: process.env.DB_DBNAME || 'bed9h5amw0w6whhfx3il',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});



pool.getConnection((err, conn) => {
    if(err) console.log(err)
    console.log("Connected successfully")
})

module.exports = pool.promise()