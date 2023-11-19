const express = require('express');
const cors = require('cors');
const conn = require('./db');

const PORT = 5000;

const app = express()
app.use(cors())

app.get('/', (req, res) => {
    return res.json(
        'Hi! (from Backend)'
    )
})

app.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`))

app.get('/reviews', function (req, res){
    const queryStr = "SELECT * FROM reviews";
    conn.query(queryStr, (err, results) => {
        if (err){
            console.log(err);
            res.error(err.sqlMessage, res);
        } 
        else{
            res.status(200).json({
                "success" : true,
                "message" : "You did good",
                "data" : results
            });
        }
    })
})