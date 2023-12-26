const express = require('express');
const router = express.Router();    
const{
    getUsers,
    postUser,
    getUser,
    putUser,
    deleteUser
}=require('../controllers/UserController');

router.route('/').get(getUsers).post(postUser);

router.route('/:id').get(getUser).put(putUser).delete(deleteUser);

module.exports=router;