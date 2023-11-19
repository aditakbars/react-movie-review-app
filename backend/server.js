const express = require('express');
const cors = require('cors');
const conn = require('./db');

require('dotenv').config()

const PORT = 5000;

const app = express()
app.use(express.urlencoded({extended: false}))
app.use(cors());

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
            res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: err.sqlMessage
            });
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

app.get('/reviews/:id', function (req, res) {
    const reviewId = req.params.id;
    const queryStr = "SELECT * FROM reviews WHERE review_id = ?";
    
    conn.query(queryStr, [reviewId], (err, results) => {
        if (err) {
            console.log(err);
            res.status(500).json({
                "success": false,
                "message": "Error fetching review",
                "error": err.sqlMessage
            });
        } else {
            if (results.length === 0) {
                res.status(404).json({
                    "success": false,
                    "message": "Review not found"
                });
            } else {
                res.status(200).json({
                    "success": true,
                    "message": "Review fetched successfully",
                    "data": results[0]
                });
            }
        }
    });
});