const express = require('express');
const router = express.Router();    

const {
  addToShoppingCart,
  getShoppingCart,
  deleteShoppingCart,
  updateQuantityInShoppingCart,
  getIpAddress,
} = require("../controllers/ShopingCartController");

router.route('/').post(addToShoppingCart).get(getShoppingCart).put(updateQuantityInShoppingCart)
router.route('/:id').delete(deleteShoppingCart);
router.route('/ip').get(getIpAddress);

module.exports = router;