const pool = require('../config/dbconnection');
const db = pool;

const getProducts = async (req, res) => {
    try {
        const [result] = await db.query('SELECT products.*, categories.name as category_name FROM products INNER JOIN categories ON products.category_id = categories.id');
        res.send(result);
        console.log(result);
    } catch (error) {
        console.error('Error retrieving products:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
};

const postProduct = async (req, res) => {
    try {
        const { name, slug, short_description, description, regular_price, sale_price, SKU, stock_status, featured, quantity, image, category_id, images, subcategory_id } = req.body;
        await db.query('INSERT INTO products (name, slug, short_description, description, regular_price, sale_price, SKU, stock_status, featured, quantity, image, category_id, images, subcategory_id) VALUES (?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?)', [name, slug, short_description, description, regular_price, sale_price, SKU, stock_status, featured, quantity, image, category_id, images, subcategory_id]);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error inserting product:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
};

const getProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const [result] = await db.query(`
            SELECT
                products.*,
                categories.name AS category_name,
                product_attributes.name AS PV_name,
                attribute_values.value AS AV_value
            FROM
                products
            INNER JOIN
                categories ON products.category_id = categories.id
            LEFT JOIN
                attribute_values ON products.id = attribute_values.product_id
            LEFT JOIN
                product_attributes ON attribute_values.product_attribute_id = product_attributes.id
            WHERE
                products.id = ?
        `, [productId]);

        const organizedData = {};

        result.forEach((product) => {
            const productId = product.id;

            if (!organizedData[productId]) {
                organizedData[productId] = { ...product, attributes: {} };
            }

            if (product.PV_name && product.AV_value) {
                if (!organizedData[productId].attributes[product.PV_name]) {
                    organizedData[productId].attributes[product.PV_name] = [];
                }

                organizedData[productId].attributes[product.PV_name].push(product.AV_value);
            }
        });

        const finalResult = Object.values(organizedData).map(({ PV_name, AV_value, ...rest }) => {
            return {
                ...rest,
                attributes: Object.entries(rest.attributes).map(([name, values]) => ({
                    name,
                    values,
                })),
            };
        });

        res.json(finalResult);
    } catch (error) {
        console.error('Error querying product:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
};

const putProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, price, description, image } = req.body;
        await db.query('UPDATE products SET name = ?, price = ?, description = ?, image = ? WHERE id = ?', [name, price, description, image, productId]);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        await db.query('DELETE FROM products WHERE id = ?', [productId]);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
};

module.exports = {
    getProducts,
    postProduct,
    getProduct,
    putProduct,
    deleteProduct
};
