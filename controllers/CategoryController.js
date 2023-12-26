const connectDB = require('../config/dbconnection');
const db = connectDB(); 


// Get all categories
const getCategories = (req, res) => {
    // ... (your existing code)

    // Use the db connection to query the database
    db.query('SELECT * FROM categories', (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send(result);
        }
    });
}

// Create a new category
const postCategory = (req, res) => {
    const { name,slug,image,is_popular } = req.body;
    db.query('INSERT INTO categories (name,slug,image,is_popular) VALUES (?, ?, ?,?)', [name,slug,image,is_popular], (err, result) => {
        if (err) {
            console.error('Error inserting category:', err);
            res.status(500).send('Internal Server Error: ' + err.message); // Send the error message in the response
        } else {
            res.sendStatus(200); // OK
        }
    });
}


// Get a single category
const getCategory = (req, res) => {
    const categoryId = req.params.id;
    db.query('SELECT  products.id AS id, products.name AS name, products.short_description AS short_description,products.description AS description,products.regular_price AS regular_price,products.sale_price AS sale_price,products.SKU AS SKU,products.stock_status AS stock_status,products.featured AS featured,products.quantity AS quantity,products.image AS image,products.images AS images,products.subcategory_id AS subcategory_id FROM products INNER JOIN categories ON products.category_id = categories.id WHERE categories.id = ?', [categoryId], (err, result) => {
        if (err) {
            console.error('Error getting category:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send(result);
        }
    }
    );
}

// Update a category
const putCategory= (req, res) => {
    const categoryId = req.params.id;
    const { name,slug,image,is_popular } = req.body;
    db.query('UPDATE categories SET name = ?, slug = ?, image = ?, is_popular = ? WHERE id = ?', [name,slug,image,is_popular, categoryId], (err, result) => {
        if (err) {
            console.error('Error updating category:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.sendStatus(200); // OK
        }
    });
}

// Delete a category
const deleteCategory= (req, res) => {
    const categoryId = req.params.id;
    db.query('DELETE FROM categories WHERE id = ?', [categoryId], (err, result) => {
        if (err) {
            console.error('Error deleting category:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.sendStatus(200); // OK
        }
    });
}

module.exports = {
    getCategories,
    postCategory,
    getCategory,
    putCategory,
    deleteCategory
};
