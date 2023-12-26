const express = require('express');
const router = express.Router();    
const {search}=require('../controllers/SearchController');

router.route('/:searchQuery').get(search);

module.exports=router;