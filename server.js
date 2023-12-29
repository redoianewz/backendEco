//server.js
const express = require('express');
const session = require("express-session");
const path = require('path');
const cors = require('cors');
const os = require('os');
 const dotenv = require('dotenv');
 const uuid = require("uuid");

dotenv.config();


const app = express();
const port = process.env.PORT || 5001;
app.use(express.json());
app.use(cors());

app.use(express.urlencoded({extended: false}))
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// const upload= multer({storage:storage});


app.use('/images', express.static(path.join(__dirname, 'photos')));


app.use('/api/products',require('./Routes/ProdutRoute'));
app.use('/api/categories',require('./Routes/CategoryRoute'));
app.use('/api/wishlist',require('./Routes/wishlistRoute'));
app.use('/api/search', require('./Routes/SearchRoute'));
app.use('/api/shoppingCart', require('./Routes/ShopingCartRoute'));
app.use('/api/checkout', require('./Routes/Checkout'));
app.use("/api/ip", async (req, res) => {
  // Retrieve the user's IP address
  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "";
  if (!req.session.ip) {
    req.session.ip = ip;
  }

  // Send the user's specific IP address
  res.send("Your IP address is: " + req.session.ip);
});;


app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
function getIpAddress() {
    const networkInterfaces = os.networkInterfaces();
    let ipAddress;

    // Iterate over network interfaces
    Object.keys(networkInterfaces).forEach((key) => {
        const iface = networkInterfaces[key];

        iface.forEach((entry) => {
            // Look for IPv4 addresses (ignore IPv6)
            if (!entry.internal && entry.family === 'IPv4') {
                ipAddress = entry.address;
            }
        });
    });

    return ipAddress;
}