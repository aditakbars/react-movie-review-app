const mysql = require('mysql');

const conn  = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USERNAME, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

conn.getConnection((err) => {
    if (err) throw err
    console.log('Database Connected!')
});

module.exports = conn