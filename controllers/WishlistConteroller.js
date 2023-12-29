const e = require("express");
const pool = require("../config/dbconnection");
const db = pool;
const session = require("express-session");
const uuid = require("uuid");
const { v4: uuidv4 } = require("uuid");

// Ensure userId is set in the session
const ensureUserId = (req) => {
  if (!req.session.userId) {
    req.session.userId = uuidv4();
  }
};

const addTowishlist = async (req, res) => {
  try {
    const { productId, quantity, price, productAttributes } = req.body;

    // Ensure userId is set
    ensureUserId(req);

    const existingCartSql = `
      SELECT id FROM wishlist WHERE ip_machine = ? LIMIT 1
    `;
    const [existingCartResult] = await db.query(existingCartSql, [
      req.session.userId,
    ]);

    let cartId;

    if (existingCartResult.length > 0) {
      // If a cart already exists, use its ID
      cartId = existingCartResult[0].id;
    } else {
      // If no cart exists, create a new one
      const insertCartSql = `
        INSERT INTO wishlist (ip_machine, constent)
        VALUES (?, ?)
      `;
      const [cartResult] = await db.query(insertCartSql, [
        req.session.userId,
        "wishlist",
      ]);
      cartId = cartResult.insertId;
    }

    // Step 3: Insert into wishlistitem table
    const insertCartItemSql = `
      INSERT INTO wishlistitem (wishlist_id, product_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `;
    const [itemResult] = await db.query(insertCartItemSql, [
      cartId,
      productId,
      quantity,
      price,
    ]);

    // Step 4: Insert product attributes into wishlistitemattributes table
    if (productAttributes && productAttributes.length > 0) {
      const insertAttributesSql = `
        INSERT INTO wishlistitemattributes (wishlist_item_id, product_attribute, attribute_value)
        VALUES (?, ?, ?)
      `;

      for (const attribute of productAttributes) {
        await db.query(insertAttributesSql, [
          itemResult.insertId,
          attribute.attributeId,
          attribute.attributeValue,
        ]);
      }
    }

    res.send("Product added to shopping cart successfully");
  } catch (error) {
    console.error("Error creating new cart:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const getwishlist = async (req, res) => {
  try {
    // Ensure userId is set
    ensureUserId(req);

    const [result] = await db.query(
      `
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
         wishlist.Ip_machine = ?  
    `,
      [req.session.userId]
    );

    const organizedData = {};

    result.forEach((cartItem) => {
      const {
        wishlist_id,
        user_id,
        Ip_machine,
        constent,
        item_id,
        product_id,
        name,
        regular_price,
        image,
        quantity,
        price,
        attribute_id,
        product_attribute,
        attribute_value,
        ...productInfo
      } = cartItem;

      if (!organizedData[wishlist_id]) {
        organizedData[wishlist_id] = {
          wishlist_id,
          user_id,
          Ip_machine,
          constent,
          items: [],
        };
      }

      if (!organizedData[wishlist_id].items[item_id]) {
        organizedData[wishlist_id].items[item_id] = {
          item_id,
          product_id,
          quantity,
          name,
          regular_price,
          image,
          price,
          attributes: {},
        };
      }

      if (attribute_id && product_attribute && attribute_value) {
        if (
          !organizedData[wishlist_id].items[item_id].attributes[product_attribute]
        ) {
          organizedData[wishlist_id].items[item_id].attributes[product_attribute] =
            [];
        }

        organizedData[wishlist_id].items[item_id].attributes[
          product_attribute
        ].push(attribute_value);
      }
    });

    const finalResult = Object.values(organizedData).map(
      ({ items, ...cartInfo }) => {
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
      }
    );
    console.log("Result:", result);
    console.log("Final result:", finalResult);
    console.log("User ID:", req.session.userId);

    res.send(finalResult);
  } catch (error) {
    console.error("Error getting shopping cart:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const deletewishlist = async (req, res) => {
  try {
    const idshopcartItem = req.params.id;
    const { userId } = req.body;
    ensureUserId(req);

    const deleteProductSql = `
      DELETE FROM wishlistitem
      WHERE id = ? AND wishlist_id IN (SELECT id FROM wishlist WHERE user_id = ? OR ip_machine = ?)
    `;

    const [result] = await db.query(deleteProductSql, [
      idshopcartItem,
      userId,
      req.session.userId,
    ]);

    res.send("Product deleted from cart successfully");
  } catch (error) {
    console.error("Error deleting product from cart:", error);
    res.status(500).send("Error deleting product from cart");
  }
};

module.exports = {
  getwishlist,
  addTowishlist,
  deletewishlist,
};
