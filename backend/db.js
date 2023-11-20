const mysql = require('mysql');

const conn  = mysql.createPool({
    host: 'dmg.h.filess.io', 
    user: 'mymoviereviewdb_seedsymbol', 
    password: '34f09b227374bb377d125c86cce005f15e08211a',
    database: 'mymoviereviewdb_seedsymbol',
    port: '3307',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

conn.getConnection((err) => {
    if (err) throw err
    console.log('Database Connected!')
});

module.exports = conn