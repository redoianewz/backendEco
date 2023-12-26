const getConstacts=(req,res)=>{
    res.json({
        message:'get all contacts'
    });
};

const postConstact=(req,res)=>{
    console.log("the request body is: ",req.body);
    res.json({message:'post a contact'});
};

const getConstact=(req,res)=>{
    
    res.json({message:`get contact with id ${req.params.id}`});
};

const putConstact=(req,res)=>{
    res.json({
        message:`put contact with id ${req.params.id}`
    });
};

const deleteConstact=(req,res)=>{
    res.json({
        message:`delete contact with id ${req.params.id}`
    });
};

module.exports={
    getConstacts,
    postConstact,
    getConstact,
    putConstact,
    deleteConstact
};