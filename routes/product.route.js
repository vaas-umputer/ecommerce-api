const express=require('express');
const router = express.Router();
const {getProducts,getProduct,createProduct,updateProduct,deletProduct}=require('../controller/product.controller');


router.get('/',getProducts);

router.get('/:id',getProduct);


router.post('/',createProduct );

router.put('/:id',updateProduct);


router.delete('/:id',deletProduct);

module.exports=router;