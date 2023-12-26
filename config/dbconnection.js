// dbconnection.js
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = () => {   
    const db = mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || null,
        database: process.env.DB_NAME || 'ecommerce_express_nextjs'
    });

    db.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL database:', err);
            return;
        }
        console.log('Connected to MySQL database');
    });

    return db;
};

module.exports = connectDB;
