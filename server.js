const express = require("express");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");
const pool = require("./config/dbconnection") // Assuming dbconnection.js is in the same directory

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000", // Replace with your frontend URL
  })
);

app.use(
  session({
    secret: uuidv4(),
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(express.urlencoded({ extended: false }));

app.use("/images", express.static(path.join(__dirname, "photos")));
app.use("/api/products", require("./Routes/ProdutRoute"));
app.use("/api/categories", require("./Routes/CategoryRoute"));
app.use("/api/wishlist", require("./Routes/wishlistRoute"));
app.use("/api/search", require("./Routes/SearchRoute"));
app.use("/api/shoppingCart", require("./Routes/ShopingCartRoute"));
app.use("/api/checkout", require("./Routes/Checkout"));

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});

module.exports = app;
