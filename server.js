//server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const os = require('os');
 const dotenv = require('dotenv');
 const uuid = require("uuid");

dotenv.config();


// Call the connectDB function to set up the database connection


const app = express();
const port = process.env.PORT || 5001;
app.use(express.json());
app.use(cors());

app.use(express.urlencoded({extended: false}))

// const upload= multer({storage:storage});


app.use('/images', express.static(path.join(__dirname, 'photos')));


app.use('/api/products',require('./Routes/ProdutRoute'));
app.use('/api/categories',require('./Routes/CategoryRoute'));
app.use('/api/wishlist',require('./Routes/wishlistRoute'));
app.use('/api/search', require('./Routes/SearchRoute'));
app.use('/api/shoppingCart', require('./Routes/ShopingCartRoute'));
app.use('/api/checkout', require('./Routes/Checkout'));

app.use("/api/ip", async (req, res) => {
  const ip =
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"] ||
    req.headers["cf-connecting-ip"] ||
    req.socket.remoteAddress ||
    "";

  res.send(ip);
});


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