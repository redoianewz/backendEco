const express = require('express');
const router = express.Router();    

const {
    getCategories,
    postCategory,
    getCategory,
    putCategory,
    deleteCategory}=require('../controllers/CategoryController');

router.route('/').get(getCategories).post(postCategory);

router.route('/:id').get(getCategory).put(putCategory).delete(deleteCategory);

module.exports=router;