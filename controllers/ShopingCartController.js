// Desc: Controller for shopping cart
const pool = require("../config/dbconnection");
const db = pool;

const addToShoppingCart = async (req, res) => {
  try {
    const {uuid, productId, quantity, price, productAttributes  } = req.body;

    // Ensure uuid i set
    const existingCartSql = `
      SELECT id FROM shoppingcart WHERE Ip_machine = ? LIMIT 1
    `;
    const [existingCartResult] = await db.query(existingCartSql, [uuid]);

    let cartId;

    if (existingCartResult.length > 0) {
      cartId = existingCartResult[0].id;
    } else {
      // If no cart exists, create a new one
      const insertCartSql = `
        INSERT INTO shoppingcart (Ip_machine, constent)
        VALUES (?, ?)
      `;
      const [cartResult] = await db.query(insertCartSql, [uuid, "cart"]);
      cartId = cartResult.insertId;
    }

    // Step 3: Insert into shoppingcartitem table
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

    // Step 4: Insert product attributes into shoppingcartitemattributes table
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

    res.send("Product added to shopping cart successfully");
  } catch (error) {
    console.error("Error creating new cart:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const getShoppingCart = async (req, res) => { 
  try {
        const idcart = req.params.id;
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
      [idcart]
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
    console.log("Result:", result);
    console.log("Final result:", finalResult);

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
    const { itemId, quantity } = req.body;
    const userId = req.params.userId;

    console.log("itemId:", itemId);
    console.log("quantity:", quantity);
    console.log("userId:", userId);

    const updateQuantitySql = `
      UPDATE shoppingcartitem
      SET quantity = ?
      WHERE id = ? AND cart_id IN (SELECT id FROM shoppingcart WHERE ip_machine = ?)
    `;

    const [result] = await db.query(updateQuantitySql, [
      quantity,
      itemId,
      userId
    ]);

    console.log("Result:", result); // Log the result to check if the update was successful

    res.send("Quantity updated successfully");
  } catch (error) {
    console.error("Error updating quantity in shopping cart:", error);
    res.status(500).send("Error updating quantity in the shopping cart");
  }
};


const deleteShoppingCart = async (req, res) => {
  try {
    const idshopcartItem = req.params.id;
    const userId= req.params.userId;

    const deleteProductSql = `
      DELETE FROM shoppingcartitem
      WHERE id = ? AND cart_id IN (SELECT id FROM shoppingcart WHERE ip_machine = ?)
    `;

    const [result] = await db.query(deleteProductSql, [
      idshopcartItem,
      userId,    
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
