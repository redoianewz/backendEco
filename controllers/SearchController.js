// searchController.js

const connectDB = require('../config/dbconnection');
const db = connectDB();

const search = (req, res) => {
    const { searchQuery } = req.params;
    db.query('select * from products where name like ?', ['%' + searchQuery + '%'], (err, result) => {
        if (err) {
            res.status(400).json({
                error: err,
            });
        }
        res.status(200).json({
            result,
        });
    }
    );
}

module.exports = { search };
