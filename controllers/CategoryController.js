const pool = require('../config/dbconnection');
const db = pool;

const getCategories = async (req, res) => {
    try {
        const [rows, fields] = await db.query('SELECT * FROM categories');
        res.send(rows); 
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Internal Server Error');
    }
}

const postCategory = async (req, res) => {
    try {
        const { name, slug, image, is_popular } = req.body;
        const result = await db.query('INSERT INTO categories (name, slug, image, is_popular) VALUES (?, ?, ?, ?)', [name, slug, image, is_popular]);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error inserting category:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
}

const getCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const [result] = await db.query('SELECT * FROM categories WHERE id = ?', [categoryId]);
        res.json(result);
    } catch (error) {
        console.error('Error getting category:', error);
        res.status(500).send('Internal Server Error');
    }
}

const putCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, slug, image, is_popular } = req.body;
        await db.query('UPDATE categories SET name = ?, slug = ?, image = ?, is_popular = ? WHERE id = ?', [name, slug, image, is_popular, categoryId]);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).send('Internal Server Error');
    }
}

const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        await db.query('DELETE FROM categories WHERE id = ?', [categoryId]);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    getCategories,
    postCategory,
    getCategory,
    putCategory,
    deleteCategory
};
