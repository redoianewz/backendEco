const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");


dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());
app.use(cors());



app.use(express.urlencoded({ extended: false }));

app.use("/images", express.static(path.join(__dirname, "photos")));
app.use("/api/products", require("./Routes/ProdutRoute"));
app.use("/api/categories", require("./Routes/CategoryRoute"));
app.use("/api/wishlist", require("./Routes/wishlistRoute"));
app.use("/api/search", require("./Routes/SearchRoute"));
app.use("/api/shoppingCart", require("./Routes/ShopingCartRoute"));
app.use("/api/checkout", require("./Routes/Checkout"));
app.post('/api/addToShoppingCart', async (req, res) => {
  try {
    const {uuid} = req.body;         
      const cartResult = await db.query("INSERT INTO shoppingcart (ip_machine, constent) VALUES (?, ?)", [uuid, "cart"]);          

    res.send("Product added to shopping cart successfully", cartResult);
  } catch (error) {
    console.error("Error creating new cart:", error);
    res.status(500).json({
      error: "Error creating new cart",
    });
  } 
});

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});

module.exports = app;
