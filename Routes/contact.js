const express=require('express');
const router=express.Router();

const {
    getConstacts,
    postConstact,
    getConstact,
    putConstact,
    deleteConstact
}=require('../controllers/contactContoller');

router.route('/').get(getConstacts).post(postConstact);

router.route('/:id').get(getConstact).put(putConstact).delete(deleteConstact);
module.exports=router;