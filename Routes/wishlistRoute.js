const express = require('express');
const router = express.Router();    

const{  getShoppingCart, addToShoppingCart,deleteShoppingCart }=require('../controllers/WishlistConteroller');

router.route('/').post(addToShoppingCart).get(getShoppingCart);
router.route('/:id').delete(deleteShoppingCart);

module.exports = router;