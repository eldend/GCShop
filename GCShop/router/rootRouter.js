const express = require('express');
var router = express.Router();

var root = require('../lib/root');

router.get('/',(req, res)=>{
    root.home(req,res);
})
router.get('/category/:categ',(req, res)=>{
    root.categoryview(req,res);
})
router.post('/search',(req, res)=>{
    root.search(req,res);
}) 
router.get('/detail/:merId',(req, res)=>{
    root.detail(req,res);
}) 
router.get('/cartview',(req, res)=>{
    root.cartview(req,res);
}) 
router.get('/cartview_update/:cartId',(req, res)=>{
    root.cartview_update(req,res);
}) 
router.post('/cartview_update_process',(req, res)=>{
    root.cartview_update_process(req,res);
}) 
router.get('/cartview_delete/:cartId',(req, res)=>{
    root.cartview_delete(req,res);
}) 
router.get('/purchaseview',(req, res)=>{
    root.purchaseview(req,res);
}) 
router.get('/purchaseupdate/:purchaseId',(req, res)=>{
    root.purchaseupdate(req,res);
})
router.post('/purchaseupdate_process', (req, res) => {
    root.purchaseupdate_process(req,res);
});
router.get('/purchasedelete/:purchaseId',(req, res)=>{
    root.purchasedelete(req,res);
})
router.get('/table',(req, res)=>{
    root.table(req,res);
})
router.get('/table/view/:tableName',(req, res)=>{
    root.tableview(req,res);
}) 
router.get('/anal/customer',(req, res)=>{
    root.anal(req,res);
}) 
module.exports = router;