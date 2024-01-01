// Desc: Controller for shopping cart
const pool = require("../config/dbconnection");
const db = pool;

const addTowishlist = async (req, res) => {
  try {
    const { productId, quantity, price, productAttributes, uuid } = req.body;

    // Ensure uuid i set
    const existingCartSql = `
      SELECT id FROM wishlist WHERE ip_machine = ? LIMIT 1
    `;
    const [existingCartResult] = await db.query(existingCartSql, [uuid]);

    let cartId;

    if (existingCartResult.length > 0) {
      cartId = existingCartResult[0].id;
    } else {
      // If no cart exists, create a new one
      const insertCartSql = `
        INSERT INTO wishlist (ip_machine, constent)
        VALUES (?, ?)
      `;
      const [cartResult] = await db.query(insertCartSql, [uuid, "cart"]);
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
    const idcart = req.params.id;
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
      [idcart]
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

const updateQuantityInwishlist = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const userId = "8f6d2a05-a5f8-41dc-b6e5-071cb22cc3bb";

    console.log("itemId:", itemId);
    console.log("quantity:", quantity);
    console.log("userId:", userId);

    const updateQuantitySql = `
      UPDATE wishlistitem
      SET quantity = ?
      WHERE id = ? AND wishlist_id IN (SELECT id FROM wishlist WHERE ip_machine = ?)
    `;

    const [result] = await db.query(updateQuantitySql, [
      quantity,
      itemId,
      userId,
    ]);

    console.log("Result:", result); // Log the result to check if the update was successful

    res.send("Quantity updated successfully");
  } catch (error) {
    console.error("Error updating quantity in shopping cart:", error);
    res.status(500).send("Error updating quantity in the shopping cart");
  }
};

const deletewishlist = async (req, res) => {
  try {
    const idshopcartItem = req.params.id;
    const userId = req.params.userId;

    const deleteProductSql = `
      DELETE FROM wishlistitem
      WHERE id = ? AND wishlist_id IN (SELECT id FROM wishlist WHERE ip_machine = ?)
    `;

    const [result] = await db.query(deleteProductSql, [idshopcartItem, userId]);

    res.send("Product deleted from cart successfully");
  } catch (error) {
    console.error("Error deleting product from cart:", error);
    res.status(500).send("Error deleting product from cart");
  }
};

module.exports = {
  addTowishlist,
  getwishlist,
  deletewishlist,
 
};
