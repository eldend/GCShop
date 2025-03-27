var db = require('./db');
var sanitizeHtml = require('sanitize-html');

const util = require('./util');
module.exports = {
    home : (req, res) => {
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from product;`
        var sql3 = `select * from code;`
        db.query(sql1 + sql2 + sql3, (err, results) => {
            var context = {
                who : name,
                login : login,
                body : 'product.ejs',
                cls : cls,
                boardtypes: results[0],
                products : results[1],
                categorys : results[2],
                req: req,
            };
            req.app.render('mainFrame', context, (err, html) => {
                res.end(html);
            })
        })
    },
    create: (req, res) => {
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        db.query(sql1 + sql2, (err, results) => {
            var context = {
                who : name,
                login : login,
                body : 'productCU.ejs',
                cls : cls,
                boardtypes: results[0],
                categorys : results[1],
                products : results[2],
                req: req
            };
            req.app.render('mainFrame', context, (err, html) => {
                if (err) {
                    return res.status(500).send('Error rendering page');
                }
                res.end(html);
            })
        })
    },
    create_process: (req, res) => {
        var sntzedFile = req.file ? '/image/' + req.file.filename : req.body.file;
        var product = req.body;
        sntzedCategory = sanitizeHtml(product.category)
        var main_id = sntzedCategory.substr(0,4)
        var sub_id = sntzedCategory.substr(4,4)
        sntzedName = sanitizeHtml(product.name)
        sntzedPrice = parseInt(sanitizeHtml(product.price))
        sntzedStock = parseInt(sanitizeHtml(product.stock))
        sntzedBrand = sanitizeHtml(product.brand)
        sntzedSupplier = sanitizeHtml(product.supplier)
        sntzedSaleYn = sanitizeHtml(product.sale_yn)
        sntzedSalePrice = parseInt(sanitizeHtml(product.sale_price))
        db.query(`INSERT INTO product (main_id, sub_id, name, price, stock, brand, supplier, image, sale_yn, sale_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [main_id, sub_id, sntzedName, sntzedPrice, sntzedStock, sntzedBrand, sntzedSupplier, sntzedFile, sntzedSaleYn, sntzedSalePrice], (error, result) => {
            if (error) {
                throw error; 
            }
        res.writeHead(302, { Location: `/product/view` });
        res.end(); 
        });
    },
    update: (req, res) => {
        var { name, login, cls } = util.authIsOwner(req, res);
        const { merId } = req.params;
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        db.query( sql1+sql2+'SELECT * FROM product WHERE mer_id = ?', 
            [merId], (error, results) => {
            if (error) {
                throw error;
            }
            var context = {
                who : name,
                login : login,
                body : 'productCU.ejs',
                cls : cls,
                boardtypes: results[0],
                categorys : results[1],
                products : results[2],
                req: req
            };
            
            res.render('mainFrame', context, (err, html) => {
                if (err) {
                    return res.status(500).send('Error rendering page');
                }
                res.end(html);
            });
        });
    },
    update_process: (req, res) => {
        var file = req.file ? '/image/' + req.file.filename : req.body.file;
        var product = req.body;
        sntzedMerId = sanitizeHtml(product.mer_id)
        sntzedCategory = sanitizeHtml(product.category)
        var main_id = sntzedCategory.substr(0,4)
        var sub_id = sntzedCategory.substr(4,4)
        sntzedName = sanitizeHtml(product.name)
        sntzedPrice = parseInt(sanitizeHtml(product.price))
        sntzedStock = parseInt(sanitizeHtml(product.stock))
        sntzedBrand = sanitizeHtml(product.brand)
        sntzedSupplier = sanitizeHtml(product.supplier)
        sntzedFile = file
        sntzedSaleYn = sanitizeHtml(product.sale_yn)
        sntzedSalePrice = parseInt(sanitizeHtml(product.sale_price))
        db.query(`UPDATE product SET main_id = ?, sub_id = ?, name = ?, price = ?, stock = ?, brand = ?, supplier = ?, image = ?, sale_yn = ?, sale_price = ? WHERE mer_id = ?`,
            [main_id, sub_id, sntzedName, sntzedPrice, sntzedStock, sntzedBrand, sntzedSupplier, sntzedFile, sntzedSaleYn, sntzedSalePrice, sntzedMerId], (error, result) => {
                if (error) {
                    throw error;
                }
            res.writeHead(302, { Location: `/product/view` });
            res.end();
        });
    },
    delete_process: (req, res) => {
        const { merId } = req.params;
        db.query('DELETE FROM product WHERE mer_id = ?', 
            [merId], (error, result) => {
            if (error) {
                throw error;
            }
            res.writeHead(302, { Location: '/product/view' });
            res.end();
        });
    },
}