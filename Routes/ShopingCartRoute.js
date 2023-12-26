const express = require('express');
const router = express.Router();    

const{  getShoppingCart, addToShoppingCart,deleteShoppingCart,updateQuantityInShoppingCart }=require('../controllers/ShopingCartController');

router.route('/').post(addToShoppingCart).get(getShoppingCart).put(updateQuantityInShoppingCart)
router.route('/:id').delete(deleteShoppingCart);

module.exports = router;