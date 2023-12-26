const connectDB = require('../config/dbconnection');
const db = connectDB();


const getOrders=(req, res) => {
    const orderId = req.params.id;
    const sql = `
        SELECT orders.id, orders.subtotal, orders.firstname, orders.lastname, orders.mobile, orders.adress, orders.adinformation, orders.city, orders.status, orders.created_at, order_items.product_id, order_items.quantity, order_items.price, order_items.attributes
        FROM orders
        JOIN order_items ON orders.id = order_items.order_id
        WHERE orders.user_id = ?
    `;
    db.query(sql, [orderId], (err, result) => {
        if (err) {
            console.error('Error retrieving order:', err);
            res.status(500).send('Internal Server Error: ' + err.message);
        } else {
            const order = result[0];
            const items = result.map((item) => ({
                productId: item.product_id,
                quantity: item.quantity,
                price: item.price,
                attributes: JSON.parse(item.attributes),
            }));
            res.send({
                ...order,
                items,
            });
        }
    });
}

