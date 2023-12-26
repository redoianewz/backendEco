const express = require('express');
const router = express.Router();    

const{  getProducts,
    postProduct,
    getProduct,
    putProduct,
    deleteProduct   }=require('../controllers/ProductController');

router.route('/').get(getProducts).post(postProduct);

router.route('/:id').get(getProduct).put(putProduct).delete(deleteProduct);

module.exports=router;