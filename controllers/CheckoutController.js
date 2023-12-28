// Desc: Controller for checkout
const pool = require('../config/dbconnection');
const db = pool;

const createOrder = async (req, res) => {
    try {
        const { userId, subtotal, firstname, lastname, mobile, address, adinformation, city, status, items } = req.body;

        // Step 1: Insert order details
        const insertOrderSql = `
            INSERT INTO orders (user_id, subtotal, firstname, lastname, mobile, adress, adinformation, city, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [orderResult] = await db.query(
            insertOrderSql,
            [userId, subtotal, firstname, lastname, mobile, address, adinformation, city, status]
        );
        
        const orderId = orderResult.insertId;

        // Step 2: Insert order items
        const insertOrderItemSql = `
            INSERT INTO order_items (order_id, product_id, quantity, price, attributes)
            VALUES (?, ?, ?, ?, ?)
        `;

        for (const item of items) {
            const { productId, quantity, price, attributes } = item;
            await db.query(
                insertOrderItemSql,
                [orderId, productId, quantity, price, JSON.stringify(attributes)]
            );
        }

        // Step 3: Delete products from shopping cart items
        const deleteShoppingCartItemsSql = `
            DELETE shoppingcartitem, shoppingcartitemattributes
            FROM shoppingcartitem
            LEFT JOIN shoppingcartitemattributes ON shoppingcartitem.id = shoppingcartitemattributes.cart_item_id
            WHERE shoppingcartitem.cart_id IN (SELECT id FROM shoppingcart WHERE ip_machine = ?)
            AND shoppingcartitem.product_id IN (?)
        `;
        const productIds = items.map((item) => item.productId);

        await db.query(deleteShoppingCartItemsSql, [req.ip, productIds]);

        console.log('Order created successfully');
        res.sendStatus(200);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
};

const getOrders = async (req, res) => {
    try {
        const userId = req.params.id;
        const sql = `
            SELECT 
                *                
            FROM orders
            WHERE orders.user_id = ?
        `;
        const [result] = await db.query(sql, [userId]);

        const clientInfo = {
            user_id: result[0].user_id,
            firstname: result[0].firstname,
            lastname: result[0].lastname,
            mobile: result[0].mobile,
            adress: result[0].adress,
            city: result[0].city,
        };
        const orders = result.map(item => {
            return {
                orderId: item.id,
                user_id: item.user_id,
                firstname: item.firstname,
                lastname: item.lastname,
                mobile: item.mobile,
                address: item.adress,
                city: item.city,
                status: item.status,
                delivered_date: item.delivered_date,
                canceled_date: item.canceled_date,
                created_at: item.formatted_created_at,
                updated_at: item.formatted_updated_at,
                subtotal: item.subtotal,                    
                adinformation: item.adinformation,
            };
        });

        // Update order quantity
        const response = {
            client: clientInfo,
            orders: orders,
        };

        res.send([response]);
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
};

const getOrder = async (req, res) => {
    try {
        const userId = req.params.userId;
        const orderId = req.params.orderId;
        const sql = `
            SELECT 
                orders.*, 
                DATE_FORMAT(orders.created_at, '%D %M %Y at %h:%i %p') AS formatted_created_at,
                DATE_FORMAT(orders.updated_at, '%D %M %Y at %h:%i %p') AS formatted_updated_at,
                order_items.*, 
                products.name AS product_name, 
                products.image AS product_image,
                products.sale_price AS product_sale_price,
                products.regular_price AS product_regular_price
            FROM orders
            JOIN order_items ON orders.id = order_items.order_id
            JOIN products ON order_items.product_id = products.id
            WHERE orders.user_id = ? AND orders.id = ?;
        `;
        const [result] = await db.query(sql, [userId, orderId]);

        if (result.length === 0) {
            // No order found for the specified user_id and order_id
            res.status(404).send('Order not found');
            return;
        }

        // Construct the order object
        const order = {
            orderId: result[0].order_id,
            user_id: result[0].user_id,
            firstname: result[0].firstname,
            lastname: result[0].lastname,
            mobile: result[0].mobile,
            address: result[0].adress,
            city: result[0].city,
            status: result[0].status,
            delivered_date: result[0].delivered_date,
            canceled_date: result[0].canceled_date,
            created_at: result[0].formatted_created_at,
            updated_at: result[0].formatted_updated_at,
            subtotal: 0,
            quantity: 0,
            adinformation: result[0].adinformation,
            items: [], // Initialize items array
        };

        // Iterate over the result set and add each item to the order
        for (const item of result) {
            const orderItem = {
                orderId: item.order_id,
                productId: item.product_id,
                productName: item.product_name,
                productImage: item.product_image,
                productSalePrice: item.product_sale_price,
                productRegularPrice: item.product_regular_price,
                quantity: item.quantity,
                subtotal: item.quantity * item.product_sale_price,
                created_at: item.formatted_created_at,
                updated_at: item.formatted_updated_at,
                attributes: JSON.parse(item.attributes),
            };

            order.items.push(orderItem);
            order.subtotal += orderItem.subtotal;
            order.quantity += orderItem.quantity;
        }

        // Send the order in the response directly
        res.send(order);
    } catch (error) {
        console.error('Error retrieving order:', error);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
};

module.exports = { createOrder, getOrders, getOrder };
