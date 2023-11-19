const mysql = require('mysql');

const conn  = mysql.createPool({
    host: 'bdu0llmd9q5xhh3vfm5y-mysql.services.clever-cloud.com', 
    user: 'uy9ulrreubsl2guy', 
    password: '5LCtIGexMZiX27KbjiTH',
    database: 'bdu0llmd9q5xhh3vfm5y',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

conn.getConnection((err) => {
    if (err) throw err
    console.log('Database Connected!')
});

module.exports = conn