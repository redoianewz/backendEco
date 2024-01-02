// Desc: This file contains the routes for the checkout page
const express=require('express');
const router=express.Router();

const {createOrder,
    getOrders,
    getOrder,
    }=require('../controllers/CheckoutController');
router.route('/').post(createOrder);
router.route('/:id').get(getOrders)
router.route('/:userId/:orderId').get(getOrder);

module.exports=router;
