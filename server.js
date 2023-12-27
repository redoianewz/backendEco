//server.js
const express = require('express');
const path = require('path');

const cors = require('cors');
;


// Call the connectDB function to set up the database connection


const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

app.use(express.urlencoded({extended: false}))

// const upload= multer({storage:storage});


app.use('/images', express.static(path.join(__dirname, 'photos')));

// app.use('/api/contacts', require('./Routes/contact'));
 app.use('/api/users', require('./Routes/UserRoute'));
// app.use('/api/products',require('./Routes/ProdutRoute'));
// app.use('/api/categories',require('./Routes/CategoryRoute'));
// app.use('/api/wishlist',require('./Routes/wishlistRoute'));
// app.use('/api/login',require('./Routes/LoginRoute'));
// app.use('/api/search', require('./Routes/SearchRoute'));
// app.use('/api/shoppingCart', require('./Routes/ShopingCartRoute'));
// app.use('/api/checkout', require('./Routes/Checkout'));




app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
