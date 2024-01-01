const express = require('express');
const router = express.Router();    

const{  getwishlist, addTowishlist,deletewishlist }=require('../controllers/WishlistConteroller');
router.route("/").post(addTowishlist);
router.route("/:id").get(getwishlist);
router.route("/:id/:userId").delete(deletewishlist)
module.exports = router;