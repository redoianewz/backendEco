const connectDB = require('../config/dbconnection');
const db = connectDB(); 


const getProducts = (req, res) => {
    // ... (your existing code)

    // Use the db connection to query the database
    db.query('SELECT products.*, categories.name as category_name  FROM products INNER JOIN categories ON products.category_id = categories.id ', (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send(result);
        }
    });
}

const postProduct = (req, res) => {
    const { name, slug, short_description,description, regular_price,sale_price,SKU, stock_status,featured, quantity,image,category_id,images, subcategory_id } = req.body;
    db.query('INSERT INTO products (name, slug, short_description,description, regular_price,sale_price,SKU, stock_status,featured, quantity,image,category_id,images, subcategory_id) VALUES (?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?)', [name, slug, short_description,description, regular_price,sale_price,SKU, stock_status,featured, quantity,image,category_id,images, subcategory_id], (err, result) => {
        if (err) {
            console.error('Error inserting product:', err);
            res.status(500).send('Internal Server Error: ' + err.message); // Send the error message in the response
        } else {
            res.sendStatus(200); // OK
        }
    });
}


const getProduct = (req, res) => {
    const productId = req.params.id;
    db.query(
        `
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
    `,
        [productId],
        (err, result) => {
            if (err) {
                console.error('Error querying product:', err);
                res.status(500).send('Internal Server Error');
            } else {
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
            }
        }
    );
};





const putProduct= (req, res) => {
    const productId = req.params.id;
    const { name, price, description, image } = req.body;
    db.query('UPDATE products SET name = ?, price = ?, description = ?, image = ? WHERE id = ?', [name, price, description, image, productId], (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.sendStatus(200); // OK
        }
    });
}

const deleteProduct= (req, res) => {
    const productId = req.params.id;
    db.query('DELETE FROM products WHERE id = ?', [productId], (err, result) => {
        if (err) {
            console.error('Error deleting product:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.sendStatus(200); // OK
        }
    });
}

module.exports = {
    getProducts,
    postProduct,
    getProduct,
    putProduct,
    deleteProduct
};