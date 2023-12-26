const connectDB = require('../config/dbconnection');
const db = connectDB();

const addToShoppingCart = (req, res) => {
  const { userId, productId, quantity, price, productAttributes, ipMachine } = req.body;
  const userIdentifier = userId || ipMachine || req.ip;
  const constent = 'cart';

  let responseSent = false; // Flag to track whether the response has been sent

  // Step 1: Check if a shopping cart already exists for the user or IP address
  const checkCartSql = `
    SELECT id
    FROM shoppingcart
    WHERE user_id = ? OR ip_machine = ?
  `;
  db.query(checkCartSql, [userId, req.ip], (checkCartErr, checkCartResult) => {
    if (checkCartErr) {
      throw checkCartErr;
    }

    if (checkCartResult.length > 0) {
      // A shopping cart already exists, use the existing cart ID
      const existingCartId = checkCartResult[0].id;
      addToExistingCart(existingCartId);
    } else {
      // No existing shopping cart, create a new one
      createNewCart();
    }
  });

  // Function to add items to an existing shopping cart
  const addToExistingCart = (cartId) => {
    if (!responseSent) {
      const insertCartItemSql = `
        INSERT INTO shoppingcartItem (cart_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `;
      db.query(
        insertCartItemSql,
        [cartId, productId, quantity, price],
        (itemErr, itemResult) => {
          if (itemErr) {
            throw itemErr;
          }

          // Step 5: Insert product attributes into shoppingcartItemAttributes table
          if (productAttributes && productAttributes.length > 0) {
            const insertAttributesSql = `
              INSERT INTO shoppingcartItemAttributes (cart_item_id, product_attribute, attribute_value)
              VALUES (?, ?, ?)
            `;

            productAttributes.forEach((attribute) => {
              db.query(
                insertAttributesSql,
                [itemResult.insertId, attribute.attributeId, attribute.attributeValue],
                (attributeErr, attributeResult) => {
                  if (attributeErr) {
                    throw attributeErr;
                  }
                }
              );
            });
          }

          res.send('Product added to existing shopping cart');
          responseSent = true; // Set the flag to true after sending the response
        }
      );
    }
  };

  // Function to create a new shopping cart
  const createNewCart = () => {
    if (!responseSent) {
      if (ipMachine || userId) {
        // Either ip_machine or user_id is present, don't create a new cart
        res.send('Product added to existing shopping cart');
      } else {
        // Neither ip_machine nor user_id is present, create a new cart
        const insertCartSql = `
          INSERT INTO shoppingcart (user_id, ip_machine, constent)
          VALUES (?, ?, ?)
        `;
        db.query(insertCartSql, [userId, req.ip, constent], (cartErr, cartResult) => {
          if (cartErr) {
            throw cartErr;
          }

          // Step 3: Get the ID of the inserted shopping cart
          const cartId = cartResult.insertId;

          // Step 4: Insert into shoppingcartItem table
          const insertCartItemSql = `
            INSERT INTO shoppingcartItem (cart_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
          `;
          db.query(
            insertCartItemSql,
            [cartId, productId, quantity, price],
            (itemErr, itemResult) => {
              if (itemErr) {
                throw itemErr;
              }

              // Step 5: Insert product attributes into shoppingcartItemAttributes table
              if (productAttributes && productAttributes.length > 0) {
                const insertAttributesSql = `
                  INSERT INTO shoppingcartItemAttributes (cart_item_id, product_attribute, attribute_value)
                  VALUES (?, ?, ?)
                `;

                productAttributes.forEach((attribute) => {
                  db.query(
                    insertAttributesSql,
                    [itemResult.insertId, attribute.attributeId, attribute.attributeValue],
                    (attributeErr, attributeResult) => {
                      if (attributeErr) {
                        throw attributeErr;
                      }
                    }
                  );
                });
              }

              res.send('Product added to new shopping cart');
              responseSent = true; // Set the flag to true after sending the response
            }
          );
        });
      }
    }
  };
};
// update quantity product in shoppingcartItem


const getShoppingCart = (req, res) => {
  db.query(
    `
    SELECT 
      shoppingcart.id AS cart_id, shoppingcart.user_id, shoppingcart.Ip_machine, shoppingcart.constent,
      shoppingcartItem.id AS item_id, shoppingcartItem.cart_id, shoppingcartItem.product_id, shoppingcartItem.quantity, shoppingcartItem.price,
      shoppingcartItemAttributes.id AS attribute_id, shoppingcartItemAttributes.cart_item_id, shoppingcartItemAttributes.product_attribute, shoppingcartItemAttributes.attribute_value,
      products.id AS product_id, products.name as name, products.regular_price as regular_price, products.sale_price, products.image as image
    FROM 
      shoppingcart
    LEFT JOIN 
      shoppingcartItem ON shoppingcart.id = shoppingcartItem.cart_id
    LEFT JOIN 
      shoppingcartItemAttributes ON shoppingcartItem.id = shoppingcartItemAttributes.cart_item_id
    LEFT JOIN 
      products ON shoppingcartItem.product_id = products.id
    WHERE 
      shoppingcart.user_id = ? OR shoppingcart.Ip_machine = ?;
  `,
    [req.body.userId, req.ip],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        const organizedData = {};

        result.forEach((cartItem) => {
          const { cart_id, user_id, Ip_machine, constent, item_id, product_id,name ,regular_price,image, quantity, price, attribute_id, product_attribute, attribute_value, ...productInfo } = cartItem;

          if (!organizedData[cart_id]) {
            organizedData[cart_id] = { cart_id, user_id, Ip_machine, constent, items: [] };
          }

          if (!organizedData[cart_id].items[item_id]) {
            organizedData[cart_id].items[item_id] = { item_id, product_id, quantity,name,regular_price,image, price, attributes: {} };
          }

          if (attribute_id && product_attribute && attribute_value) {
            if (!organizedData[cart_id].items[item_id].attributes[product_attribute]) {
              organizedData[cart_id].items[item_id].attributes[product_attribute] = [];
            }

            organizedData[cart_id].items[item_id].attributes[product_attribute].push(attribute_value);
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

        res.json(finalResult);
      }
    }
  );
};

const updateQuantityInShoppingCart = (req, res) => {
  const { userId, itemId, quantity } = req.body;

  const updateQuantitySql = `
    UPDATE shoppingcartItem
    SET quantity = ?
    WHERE id = ? AND cart_id IN (SELECT id FROM shoppingcart WHERE user_id = ? OR ip_machine = ?)
  `;

  db.query(updateQuantitySql, [quantity, itemId, userId, req.ip], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error updating quantity in the shopping cart");
    } else {
      res.send("Quantity updated successfully");
    }
  });
};

const deleteShoppingCart = (req, res) => {
  const idshopcartItem=req.params.id;
  const { userId } = req.body;
  const userIdentifier = userId || req.ip;

  const deleteProductSql = `
    DELETE FROM shoppingcartItem
    WHERE id = ? AND cart_id IN (SELECT id FROM shoppingcart WHERE user_id = ? OR ip_machine = ?)
  `;

  db.query(deleteProductSql, [idshopcartItem, userId, req.ip], (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error deleting product from cart");
    } else {
      res.send("Product deleted from cart successfully");
    }
  });
};





module.exports = { addToShoppingCart,getShoppingCart,deleteShoppingCart , updateQuantityInShoppingCart};
