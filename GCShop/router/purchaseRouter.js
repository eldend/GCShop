const express = require('express');
var router = express.Router();

var purchase = require('../lib/purchase');

router.get('/detail/:merId',(req, res)=>{
    purchase.purchasedetail(req,res);
})
router.post('/purchase_process',(req, res)=>{
    purchase.purchase_process(req,res);
})
router.get('/',(req, res)=>{
    purchase.purchase(req,res);
})
router.post('/cancel/:purchaseId',(req, res)=>{
    purchase.cancel(req,res);
})
router.post('/cart_process',(req, res)=>{
    purchase.cart_process(req,res);
})
router.get('/cart',(req, res)=>{
    purchase.cart(req,res);
})
router.post('/cart_purchase',(req, res)=>{
    purchase.cart_purchase(req,res);
})
router.post('/cart_cancel',(req, res)=>{
    purchase.cart_cancel(req,res);
})
module.exports = router;