// Desc: Controller for checkout
const connectDB = require('../config/dbconnection');
const db = connectDB();

const createOrder = (req, res) => {
    const { userId, subtotal, firstname, lastname, mobile, address, adinformation, city, status, items } = req.body;

    // Step 1: Insert order details
    const insertOrderSql = `
      INSERT INTO orders (user_id, subtotal, firstname, lastname, mobile, adress, adinformation, city, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
        insertOrderSql,
        [userId, subtotal, firstname, lastname, mobile, address, adinformation, city, status],
        (orderErr, orderResult) => {
            if (orderErr) {
                console.error('Error creating order:', orderErr);
                res.status(500).send('Internal Server Error: ' + orderErr.message);
            } else {
                const orderId = orderResult.insertId;

                // Step 2: Insert order items
                const insertOrderItemSql = `
                    INSERT INTO order_items (order_id, product_id, quantity, price, attributes)
                    VALUES (?, ?, ?, ?, ?)
                `;

                items.forEach((item) => {
                    const { productId, quantity, price, attributes } = item;
                    db.query(
                        insertOrderItemSql,
                        [orderId, productId, quantity, price, JSON.stringify(attributes)],
                        (itemErr, itemResult) => {
                            if (itemErr) {
                                console.error('Error inserting order item:', itemErr);
                                res.status(500).send('Internal Server Error: ' + itemErr.message);
                            }
                        }
                    );
                });

                // Step 3: Delete products from shopping cart items
                const deleteShoppingCartItemsSql = `
                    DELETE shoppingcartitem, shoppingcartitemattributes
                    FROM shoppingcartitem
                    LEFT JOIN shoppingcartitemattributes ON shoppingcartitem.id = shoppingcartitemattributes.cart_item_id
                    WHERE shoppingcartitem.cart_id IN (SELECT id FROM shoppingcart WHERE ip_machine = ?)
                    AND shoppingcartitem.product_id IN (?)
                `;
                const productIds = items.map((item) => item.productId);
                console.log('productIds', productIds);

                db.query(deleteShoppingCartItemsSql, [req.ip, productIds], (deleteErr, deleteResult) => {
                    if (deleteErr) {
                        console.error('Error deleting shopping cart items:', deleteErr);
                        res.status(500).send('Internal Server Error: ' + deleteErr.message);
                    } else {                        
                        res.sendStatus(200);
                        console.log('Order created successfully')
                    }
                });
            }
        }
    );
};

// const getOrders = (req, res) => {
//     const orderId = req.params.id;
//     const sql = `
//         SELECT 
//             orders.*, 
//             DATE_FORMAT(orders.created_at, '%D %M %Y at %h:%i %p') AS formatted_created_at,
//             DATE_FORMAT(orders.updated_at, '%D %M %Y at %h:%i %p') AS formatted_updated_at,
//             order_items.*, 
//             products.name AS product_name, 
//             products.image AS product_image,
//             products.sale_price AS product_sale_price,
//             products.regular_price AS product_regular_price
//         FROM orders
//         JOIN order_items ON orders.id = order_items.order_id
//         JOIN products ON order_items.product_id = products.id
//         WHERE orders.user_id = ?
//     `;
//     db.query(sql, [orderId], (err, result) => {
//         if (err) {
//             console.error('Error retrieving order:', err);
//             res.status(500).send('Internal Server Error: ' + err.message);
//         } else {
//             const order = result[0];
//             const items = result.map((item) => ({
//                 orderId: item.order_id,
//                 productId: item.product_id,
//                 productName: item.product_name,
//                 productImage: item.product_image,                
//                 productSalePrice: item.product_sale_price,
//                 productRegularPrice: item.product_regular_price,
//                 quantity: item.quantity,
//                 price: item.price,
//                 created_at: item.formatted_created_at,
//                 updated_at: item.formatted_updated_at,
//                 attributes: JSON.parse(item.attributes),
//             }));
//             res.send({
//                 ...order,
//                 items,
//             });
//         }
//     });
// };

// const getOrders = (req, res) => {
//     const orderId = req.params.id;
//     const sql = `
//         SELECT 
//             orders.*, 
//             DATE_FORMAT(orders.created_at, '%D %M %Y at %h:%i %p') AS formatted_created_at,
//             DATE_FORMAT(orders.updated_at, '%D %M %Y at %h:%i %p') AS formatted_updated_at,
//             order_items.*, 
//             products.name AS product_name, 
//             products.image AS product_image,
//             products.sale_price AS product_sale_price,
//             products.regular_price AS product_regular_price
//         FROM orders
//         JOIN order_items ON orders.id = order_items.order_id
//         JOIN products ON order_items.product_id = products.id
//         WHERE orders.user_id = ?
//     `;
//     db.query(sql, [orderId], (err, result) => {
//         if (err) {
//             console.error('Error retrieving order:', err);
//             res.status(500).send('Internal Server Error: ' + err.message);
//         } else {
//             const orders = result.map((item) => ({
//                 orderId: item.order_id,
//                 productId: item.product_id,
//                 productName: item.product_name,
//                 productImage: item.product_image,                
//                 productSalePrice: item.product_sale_price,
//                 productRegularPrice: item.product_regular_price,
//                 quantity: item.quantity,
//                 subtotal: item.subtotal,
//                 created_at: item.formatted_created_at,
//                 updated_at: item.formatted_updated_at,
//                 attributes: JSON.parse(item.attributes),
//             }));

//             // Include client information
//             const clientInfo = {
//                 user_id: result[0].user_id,
//                 firstname: result[0].firstname,
//                 lastname: result[0].lastname,
//                 mobile: result[0].mobile,
//                 address: result[0].address,
//                 adinformation: result[0].adinformation,
//                 city: result[0].city,

//                 // Add other client fields as needed
//             };

//             // Create the final response object
//             const response = {
//                 client: clientInfo,
//                 items: orders,
//             };

//             res.send(response);
//         }
//     });
// };
// const getOrder = (req, res) => {
//     const orderId = req.params.id;
//     const sql = `
//         SELECT 
//             orders.*, 
//             DATE_FORMAT(orders.created_at, '%D %M %Y at %h:%i %p') AS formatted_created_at,
//             DATE_FORMAT(orders.updated_at, '%D %M %Y at %h:%i %p') AS formatted_updated_at,
//             order_items.*, 
//             products.name AS product_name, 
//             products.image AS product_image,
//             products.sale_price AS product_sale_price,
//             products.regular_price AS product_regular_price
//         FROM orders
//         JOIN order_items ON orders.id = order_items.order_id
//         JOIN products ON order_items.product_id = products.id
//         WHERE orders.user_id = ?
//     `;
//     db.query(sql, [orderId], (err, result) => {
//         if (err) {
//             console.error('Error retrieving order:', err);
//             res.status(500).send('Internal Server Error: ' + err.message);
//         } else {
//             const clientInfo = {
//                 user_id: result[0].user_id,
//                 firstname: result[0].firstname,
//                 lastname: result[0].lastname,
//                 mobile: result[0].mobile,
//                 adress: result[0].adress,
//                 city: result[0].city,
//             };

//             const orders = [];
//             let currentOrderId;

//             for (const item of result) {
//                 if (item.order_id !== currentOrderId) {
//                     // New order, create a new order object
//                     const order = {
//                         orderId: item.order_id,
//                         status: item.status,
//                         delivered_date: item.delivered_date,
//                         canceled_date: item.canceled_date,
//                         created_at: item.formatted_created_at,
//                         updated_at: item.formatted_updated_at,
//                         subtotal: 0,  // Initialize subtotal to 0
//                         quantity: 0,  // Initialize quantity to 0
//                         adinformation: item.adinformation,
//                         items: [],
//                     };

//                     orders.push(order);
//                     currentOrderId = item.order_id;
//                 }

//                 // Add item details to the current order
//                 const orderItem = {
//                     orderId: item.order_id,
//                     productId: item.product_id,
//                     productName: item.product_name,
//                     productImage: item.product_image,
//                     productSalePrice: item.product_sale_price,
//                     productRegularPrice: item.product_regular_price,
//                     quantity: item.quantity,
//                     subtotal: item.quantity * item.product_sale_price,  // Calculate subtotal
//                     created_at: item.formatted_created_at,
//                     updated_at: item.formatted_updated_at,
//                     attributes: JSON.parse(item.attributes),
//                 };

//                 orders[orders.length - 1].items.push(orderItem);
//                 orders[orders.length - 1].subtotal += orderItem.subtotal;  // Update order subtotal
//                 orders[orders.length - 1].quantity += orderItem.quantity;  // Update order quantity
//             }

//             const response = {
//                 client: clientInfo,
//                 orders: orders,
//             };

//             res.send([response]);
//         }
//     });
// };VVVVV

// const getOrders = (req, res) => {
//     const userId = req.params.userId;
//     const orderId = req.params.orderId;
//     const sql = `
//         SELECT 
//             orders.*, 
//             DATE_FORMAT(orders.created_at, '%D %M %Y at %h:%i %p') AS formatted_created_at,
//             DATE_FORMAT(orders.updated_at, '%D %M %Y at %h:%i %p') AS formatted_updated_at,
//             order_items.*, 
//             products.name AS product_name, 
//             products.image AS product_image,
//             products.sale_price AS product_sale_price,
//             products.regular_price AS product_regular_price
//         FROM orders
//         JOIN order_items ON orders.id = order_items.order_id
//         JOIN products ON order_items.product_id = products.id
//         WHERE orders.user_id = ? AND orders.order_id = ?;
//     `;
//     db.query(sql, [userId, orderId], (err, result) => {
//         if (err) {
//             console.error('Error retrieving order:', err);
//             res.status(500).send('Internal Server Error: ' + err.message);
//         } else {
//             if (result.length === 0) {
//                 // No order found for the specified user_id and order_id
//                 res.status(404).send('Order not found');
//                 return;
//             }

//             const clientInfo = {
//                 user_id: result[0].user_id,
//                 firstname: result[0].firstname,
//                 lastname: result[0].lastname,
//                 mobile: result[0].mobile,
//                 address: result[0].address,
//                 city: result[0].city,
//             };

//             const orders = [];
//             let currentOrderId;

//             for (const item of result) {
//                 if (item.order_id !== currentOrderId) {
//                     // New order, create a new order object
//                     const order = {
//                         orderId: item.order_id,
//                         status: item.status,
//                         delivered_date: item.delivered_date,
//                         canceled_date: item.canceled_date,
//                         created_at: item.formatted_created_at,
//                         updated_at: item.formatted_updated_at,
//                         subtotal: 0,  // Initialize subtotal to 0
//                         quantity: 0,  // Initialize quantity to 0
//                         adinformation: item.adinformation,
//                         items: [],
//                     };

//                     orders.push(order);
//                     currentOrderId = item.order_id;
//                 }

//                 // Add item details to the current order
//                 const orderItem = {
//                     orderId: item.order_id,
//                     productId: item.product_id,
//                     productName: item.product_name,
//                     productImage: item.product_image,
//                     productSalePrice: item.product_sale_price,
//                     productRegularPrice: item.product_regular_price,
//                     quantity: item.quantity,
//                     subtotal: item.quantity * item.product_sale_price,  // Calculate subtotal
//                     created_at: item.formatted_created_at,
//                     updated_at: item.formatted_updated_at,
//                     attributes: JSON.parse(item.attributes),
//                 };

//                 orders[orders.length - 1].items.push(orderItem);
//                 orders[orders.length - 1].subtotal += orderItem.subtotal;  // Update order subtotal
//                 orders[orders.length - 1].quantity += orderItem.quantity;  // Update order quantity
//             }

//             const response = {
//                 client: clientInfo,
//                 orders: orders,
//             };

//             res.send([response]);
//         }
//     });
// };
const getOrders = (req, res) => {
    const orderId = req.params.id;
    const sql = `
        SELECT 
            orders.*, 
            DATE_FORMAT(orders.created_at, '%D %M %Y at %h:%i %p') AS formatted_created_at,
            DATE_FORMAT(orders.updated_at, '%D %M %Y at %h:%i %p') AS formatted_updated_at
        FROM orders
        WHERE orders.user_id = ?
    `;
    db.query(sql, [orderId], (err, result) => {
        if (err) {
            console.error('Error retrieving order:', err);
            res.status(500).send('Internal Server Error: ' + err.message);
        } else {
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
                    subtotal:item.subtotal,                    
                    adinformation: item.adinformation,
                };
            });
           
            // Update order quantity
            const response = {
                client: clientInfo,
                orders: orders,
            };

            res.send([response]);
        }
    });
};
const getOrder = (req, res) => {
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
    db.query(sql, [userId, orderId], (err, result) => {
        if (err) {
            console.error('Error retrieving order:', err);
            res.status(500).send('Internal Server Error: ' + err.message);
        } else {
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
            result.forEach((item) => {
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
            });

            // Send the order in the response directly
            res.send(order);
        }
    });
};






module.exports = {createOrder,getOrders,getOrder,};
