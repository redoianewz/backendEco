// searchController.js

const pool = require('../config/dbconnection');
const db = pool;

const search = async (req, res) => {
    try {
        const { searchQuery } = req.params;

        const columns = [
            'name', 'slug', 'short_description', 'description',
            'regular_price', 'sale_price', 'SKU', 'stock_status',
            'featured', 'quantity', 'image', 'category_id',
            'images', 'subcategory_id'
        ];

        // Generate a dynamic WHERE clause with LIKE conditions for each column
        const whereClause = columns.map(column => `${column} LIKE ?`).join(' OR ');

        // Use a prepared statement with dynamic WHERE clause
        const [result] = await db.query(`
            SELECT *
            FROM products
            WHERE ${whereClause}
        `, columns.map(column => '%' + searchQuery + '%'));

        res.send(result);
    } catch (error) {
        console.error('Error searching for products:', error);
        res.status(500).json({
            error: 'Internal Server Error',
        });
    }
};

module.exports = { search };
