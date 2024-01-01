// Desc: ShopingCart Route
const express = require('express');
const router = express.Router();    

const {
  addToShoppingCart,
  getShoppingCart,
  deleteShoppingCart,
  updateQuantityInShoppingCart,
} = require("../controllers/ShopingCartController");

router.route('/').post(addToShoppingCart)
router.route('/:id').get(getShoppingCart);
router.route('/:id/:userId').delete(deleteShoppingCart).put(updateQuantityInShoppingCart);
module.exports = router;