const pool = require("../config/dbconnection");
const db = pool;
const os = require("os");
const ipAddress = getIpAddress();
console.log("Server IP address:", ipAddress);

function getIpAddress() {
  const networkInterfaces = os.networkInterfaces();
  let ipAddress;

  // Iterate over network interfaces
  Object.keys(networkInterfaces).forEach((key) => {
    const iface = networkInterfaces[key];

    iface.forEach((entry) => {
      // Look for IPv4 addresses (ignore IPv6)
      if (!entry.internal && entry.family === "IPv4") {
        ipAddress = entry.address;
      }
    });
  });

  return ipAddress;
}


const addToShoppingCart = async (req, res) => {
  try {
    const { productId, quantity, price, productAttributes } = req.body;
    const ipAddress = getIpAddress();
    
    let responseSent = false; // Initialize local responseSent flag

    // Step 1: Check if a shopping cart already exists for the user or IP address
    const checkCartSql = `
      SELECT id
      FROM shoppingcart
      WHERE ip_machine = ?;
    `;
    const [checkCartResult] = await db.query(checkCartSql, [ipAddress]);

    if (checkCartResult.length > 0) {
      // A shopping cart already exists, use the existing cart ID
      const existingCartId = checkCartResult[0].id;
      await addToExistingCart(existingCartId, productId, quantity, price, productAttributes, res, responseSent);
    } else {
      // No existing shopping cart, create a new one
      await createNewCart(productId, quantity, price, productAttributes, res, responseSent);
    }
  } catch (error) {
    console.error("Error adding to shopping cart:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const addToExistingCart = async (cartId, productId, quantity, price, productAttributes, res, responseSent) => {
  try {
    if (!responseSent) {
      const insertCartItemSql = `
        INSERT INTO shoppingcartitem (cart_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `;
      const [itemResult] = await db.query(insertCartItemSql, [
        cartId,
        productId,
        quantity,
        price,
      ]);

      // Step 5: Insert product attributes into shoppingcartitemattributes table
      if (productAttributes && productAttributes.length > 0) {
        const insertAttributesSql = `
          INSERT INTO shoppingcartitemattributes (cart_item_id, product_attribute, attribute_value)
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

      res.send("Product added to existing shopping cart1");
    }
  } catch (error) {
    console.error("Error adding to existing cart:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const createNewCart = async (productId, quantity, price, productAttributes, res, responseSent) => {
  try {
    if (!responseSent) {
      const ipAddress = getIpAddress();

      if (ipAddress) {
        // Either req.ip or userId is present, don't create a new cart
        res.send("Product added to existing shopping cart2");
      } else {
        // Neither req.ip nor userId is present, create a new cart
        const insertCartSql = `
          INSERT INTO shoppingcart (ip_machine, content)
          VALUES (?, ?)
        `;
        const [cartResult] = await db.query(insertCartSql, [
          getIpAddress(),
          "cart",
        ]);

        // Step 3: Get the ID of the inserted shopping cart
        const cartId = cartResult.insertId;

        // Step 4: Insert into shoppingcartitem table
        const insertCartItemSql = `
          INSERT INTO shoppingcartitem (cart_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `;
        const [itemResult] = await db.query(insertCartItemSql, [
          cartId,
          productId,
          quantity,
          price,
        ]);

        // Step 5: Insert product attributes into shoppingcartitemattributes table
        if (productAttributes && productAttributes.length > 0) {
          const insertAttributesSql = `
            INSERT INTO shoppingcartitemattributes (cart_item_id, product_attribute, attribute_value)
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

        res.send("Product added to new shopping cart4");
      }
    }
  } catch (error) {
    console.error("Error creating new cart:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};


// update quantity product in shoppingcartitem

const getShoppingCart = async (req, res) => {
  try {
    const [result] = await db.query(
      `
      SELECT 
        shoppingcart.id AS cart_id, shoppingcart.user_id, shoppingcart.Ip_machine, shoppingcart.constent,
        shoppingcartitem.id AS item_id, shoppingcartitem.cart_id, shoppingcartitem.product_id, shoppingcartitem.quantity, shoppingcartitem.price,
        shoppingcartitemattributes.id AS attribute_id, shoppingcartitemattributes.cart_item_id, shoppingcartitemattributes.product_attribute, shoppingcartitemattributes.attribute_value,
        products.id AS product_id, products.name as name, products.regular_price as regular_price, products.sale_price, products.image as image
      FROM 
        shoppingcart
      LEFT JOIN 
        shoppingcartitem ON shoppingcart.id = shoppingcartitem.cart_id
      LEFT JOIN 
        shoppingcartitemattributes ON shoppingcartitem.id = shoppingcartitemattributes.cart_item_id
      LEFT JOIN 
        products ON shoppingcartitem.product_id = products.id
      WHERE 
         shoppingcart.Ip_machine = ?  
    `,
      [getIpAddress()]
    );

    const organizedData = {};

    result.forEach((cartItem) => {
      const {
        cart_id,
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

      if (!organizedData[cart_id]) {
        organizedData[cart_id] = {
          cart_id,
          user_id,
          Ip_machine,
          constent,
          items: [],
        };
      }

      if (!organizedData[cart_id].items[item_id]) {
        organizedData[cart_id].items[item_id] = {
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
          !organizedData[cart_id].items[item_id].attributes[product_attribute]
        ) {
          organizedData[cart_id].items[item_id].attributes[product_attribute] =
            [];
        }

        organizedData[cart_id].items[item_id].attributes[
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

    res.send(finalResult);
  } catch (error) {
    console.error("Error getting shopping cart:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const updateQuantityInShoppingCart = async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body;

    const updateQuantitySql = `
      UPDATE shoppingcartitem
      SET quantity = ?
      WHERE id = ? AND cart_id IN (SELECT id FROM shoppingcart WHERE user_id = ? OR ip_machine = ?)
    `;

    const [result] = await db.query(updateQuantitySql, [
      quantity,
      itemId,
      userId,
      req.ip,
    ]);

    res.send("Quantity updated successfully");
  } catch (error) {
    console.error("Error updating quantity in shopping cart:", error);
    res.status(500).send("Error updating quantity in the shopping cart");
  }
};

const deleteShoppingCart = async (req, res) => {
  try {
    const idshopcartItem = req.params.id;
    const { userId } = req.body;
    const userIdentifier = userId || req.ip;

    const deleteProductSql = `
      DELETE FROM shoppingcartitem
      WHERE id = ? AND cart_id IN (SELECT id FROM shoppingcart WHERE user_id = ? OR ip_machine = ?)
    `;

    const [result] = await db.query(deleteProductSql, [
      idshopcartItem,
      userId,
      req.ip,
    ]);

    res.send("Product deleted from cart successfully");
  } catch (error) {
    console.error("Error deleting product from cart:", error);
    res.status(500).send("Error deleting product from cart");
  }
};

module.exports = {
  addToShoppingCart,
  getShoppingCart,
  deleteShoppingCart,
  updateQuantityInShoppingCart,
};
