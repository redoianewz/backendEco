const pool = require('../config/dbconnection');
const db = pool;

const addTowishlist = async (req, res) => {
  try {
    const { userId, productId, quantity, price, productAttributes, ipMachine } = req.body;
    const userIdentifier = userId || ipMachine || req.ip;
    const constent = 'cart';

    let responseSent = false; // Flag to track whether the response has been sent

    // Step 1: Check if a shopping cart already exists for the user or IP address
    const checkCartSql = `
      SELECT id
      FROM wishlist
      WHERE user_id = ? OR ip_machine = ?
    `;
    const [checkCartResult] = await db.query(checkCartSql, [userId, req.ip]);

    if (checkCartResult.length > 0) {
      // A shopping cart already exists, use the existing cart ID
      const existingCartId = checkCartResult[0].id;
      await addToExistingCart(existingCartId);
    } else {
      // No existing shopping cart, create a new one
      await createNewCart();
    }
  } catch (error) {
    console.error('Error adding to shopping cart:', error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
};

const addToExistingCart = async (cartId) => {
  try {
    if (!responseSent) {
      const insertCartItemSql = `
        INSERT INTO wishlistitem (wishlist_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `;
      const [itemResult] = await db.query(insertCartItemSql, [cartId, productId, quantity, price]);

      // Step 5: Insert product attributes into wishlistitemattributes table
      if (productAttributes && productAttributes.length > 0) {
        const insertAttributesSql = `
          INSERT INTO wishlistitemattributes (wishlist_item_id, product_attribute, attribute_value)
          VALUES (?, ?, ?)
        `;

        for (const attribute of productAttributes) {
          await db.query(insertAttributesSql, [itemResult.insertId, attribute.attributeId, attribute.attributeValue]);
        }
      }

      res.send('Product added to existing shopping cart');
      responseSent = true; // Set the flag to true after sending the response
    }
  } catch (error) {
    console.error('Error adding to existing cart:', error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
};

const createNewCart = async () => {
  try {
    if (!responseSent) {
      if (ipMachine || userId) {
        // Either ip_machine or user_id is present, don't create a new cart
        res.send('Product added to existing shopping cart');
      } else {
        // Neither ip_machine nor user_id is present, create a new cart
        const insertCartSql = `
          INSERT INTO wishlist (user_id, ip_machine, constent)
          VALUES (?, ?, ?)
        `;
        const [cartResult] = await db.query(insertCartSql, [userId, req.ip, constent]);

        // Step 3: Get the ID of the inserted shopping cart
        const cartId = cartResult.insertId;

        // Step 4: Insert into wishlistitem table
        const insertCartItemSql = `
          INSERT INTO wishlistitem (wishlist_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `;
        const [itemResult] = await db.query(insertCartItemSql, [cartId, productId, quantity, price]);

        // Step 5: Insert product attributes into wishlistitemattributes table
        if (productAttributes && productAttributes.length > 0) {
          const insertAttributesSql = `
            INSERT INTO wishlistitemattributes (wishlist_item_id, product_attribute, attribute_value)
            VALUES (?, ?, ?)
          `;

          for (const attribute of productAttributes) {
            await db.query(insertAttributesSql, [itemResult.insertId, attribute.attributeId, attribute.attributeValue]);
          }
        }

        res.send('Product added to new shopping cart');
        responseSent = true; // Set the flag to true after sending the response
      }
    }
  } catch (error) {
    console.error('Error creating new cart:', error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
};

// update quantity product in wishlistitem

const getwishlist = async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT 
        wishlist.id AS wishlist_id, wishlist.user_id, wishlist.Ip_machine, wishlist.constent,
        wishlistitem.id AS item_id, wishlistitem.wishlist_id, wishlistitem.product_id, wishlistitem.quantity, wishlistitem.price,
        wishlistitemattributes.id AS attribute_id, wishlistitemattributes.wishlist_item_id, wishlistitemattributes.product_attribute, wishlistitemattributes.attribute_value,
        products.id AS product_id, products.name as name, products.regular_price as regular_price, products.sale_price, products.image as image
      FROM 
        wishlist
      LEFT JOIN 
        wishlistitem ON wishlist.id = wishlistitem.wishlist_id
      LEFT JOIN 
        wishlistitemattributes ON wishlistitem.id = wishlistitemattributes.wishlist_item_id
      LEFT JOIN 
        products ON wishlistitem.product_id = products.id
      WHERE 
        wishlist.user_id = ? OR wishlist.Ip_machine = ?;
    `, [req.body.userId, req.ip]);

    const organizedData = {};

    result.forEach((cartItem) => {
      const { wishlist_id, user_id, Ip_machine, constent, item_id, product_id, name, regular_price, image, quantity, price, attribute_id, product_attribute, attribute_value, ...productInfo } = cartItem;

      if (!organizedData[wishlist_id]) {
        organizedData[wishlist_id] = { wishlist_id, user_id, Ip_machine, constent, items: [] };
      }

      if (!organizedData[wishlist_id].items[item_id]) {
        organizedData[wishlist_id].items[item_id] = { item_id, product_id, quantity, name, regular_price, image, price, attributes: {} };
      }

      if (attribute_id && product_attribute && attribute_value) {
        if (!organizedData[wishlist_id].items[item_id].attributes[product_attribute]) {
          organizedData[wishlist_id].items[item_id].attributes[product_attribute] = [];
        }

        organizedData[wishlist_id].items[item_id].attributes[product_attribute].push(attribute_value);
      }
    });

    const finalResult = Object.values(organizedData).map(({ items, ...cartInfo }) => {
      return {
        ...cartInfo,
        items: Object.values(items).map(({ attributes, ...itemInfo }) => {
          return {
            ...itemInfo,
            attributes: Object.entries(attributes).map(([name, values]) => ({
              name,
              values,
            })),
          };
        }),
      };
    });

    res.send(finalResult);
  } catch (error) {
    console.error('Error getting shopping cart:', error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
};

const updateQuantityInwishlist = async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body;

    const updateQuantitySql = `
      UPDATE wishlistitem
      SET quantity = ?
      WHERE id = ? AND wishlist_id IN (SELECT id FROM wishlist WHERE user_id = ? OR ip_machine = ?)
    `;

    const [result] = await db.query(updateQuantitySql, [quantity, itemId, userId, req.ip]);

    res.send("Quantity updated successfully");
  } catch (error) {
    console.error('Error updating quantity in shopping cart:', error);
    res.status(500).send("Error updating quantity in the shopping cart");
  }
};

const deletewishlist = async (req, res) => {
  try {
    const idshopcartItem = req.params.id;
    const { userId } = req.body;
    const userIdentifier = userId || req.ip;

    const deleteProductSql = `
      DELETE FROM wishlistitem
      WHERE id = ? AND wishlist_id IN (SELECT id FROM wishlist WHERE user_id = ? OR ip_machine = ?)
    `;

    const [result] = await db.query(deleteProductSql, [idshopcartItem, userId, req.ip]);

    res.send("Product deleted from cart successfully");
  } catch (error) {
    console.error('Error deleting product from cart:', error);
    res.status(500).send("Error deleting product from cart");
  }
};

module.exports = { addTowishlist, getwishlist, deletewishlist, updateQuantityInwishlist };