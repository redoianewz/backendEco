const express = require('express');
const router = express.Router();    

const{  getwishlist, addTowishlist,deletewishlist }=require('../controllers/WishlistConteroller');

router.route('/').post(addTowishlist).get(getwishlist);
router.route('/:id').delete(deletewishlist);

module.exports = router;