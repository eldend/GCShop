var db = require('./db');
var sanitizeHtml = require('sanitize-html');

function authIsOwner(req,res){
    var name = 'Guest';
    var login = false;
    var cls = "NON";
    if(req.session.is_logined){
        name = req.session.name;
        login = true;
        cls = req.session.cls;
    }
    return {name,login,cls}
}
module.exports = {
    home : (req, res) => {
        var {name, login, cls} = authIsOwner(req, res);
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from product;`
        var sql3 = `select * from code;`
        db.query(sql1+sql2+sql3,(error,results)=>{
            var context = {
                who : name,
                login : login,
                body : 'product.ejs',
                cls : cls,
                boardtypes : results[0],
                products : results[1],
                categorys : results[2],
                req: req
            };
            req.app.render('mainFrame', context, (err, html) => {
                res.end(html);
            })
        })
    },
    categoryview : (req, res) => {
        var {name, login, cls} = authIsOwner(req, res);
        var Categ = req.params.categ;
        var main_id = Categ.substr(0,4)
        var sub_id = Categ.substr(4,4)
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        db.query(sql1 + sql2 + `SELECT * FROM product WHERE main_id = ? AND sub_id = ?`, [main_id, sub_id], (error, results) => {
            if (error) {
                console.error('Query Error:', error);
                return res.status(500).send('Database Query Error');
            }
        
            var context = {
                who: name,
                login: login,
                body: 'product.ejs',
                cls: cls,
                boardtypes: results[0],
                categorys: results[1],
                products: results[2],
                req: req
            };
        
            req.app.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.error('Render Error:', err);
                    return res.status(500).send('Rendering Error');
                }
                res.end(html);
            });
        });        
    },
    search : (req, res) => {
        var {name, login, cls} = authIsOwner(req, res);
        var body = req.body;
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        db.query(sql1+sql2+`SELECT * FROM product WHERE name like '%${body.search}%' or brand like '%${body.search}%' or supplier like '%${body.search}%'`,(error,results)=>{
            var context = {
                who : name,
                login : login,
                body : 'product.ejs',
                cls : cls,
                boardtypes : results[0],
                products : results[2],
                categorys : results[1],
                req: req
            };
            req.app.render('mainFrame', context, (err, html) => {
                res.end(html);
            })
        })
    },
    detail : (req, res) => {
        var {name, login, cls} = authIsOwner(req, res);
        var mer_id = parseInt(req.params.merId);
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        db.query(sql1 + sql2 + `SELECT * FROM product WHERE mer_id = ?`, [mer_id], (error, results) => {
            var context = {
                who : name,
                login : login,
                body : 'productDetail.ejs',
                cls : cls,
                boardtypes : results[0],
                products : results[2],
                categorys : results[1],
                req: req
            };
            req.app.render('mainFrame', context, (err, html) => {
                res.end(html);
            })
        })
    },
    cartview: (req, res) => {
        var { name, login, loginid, cls } = authIsOwner(req, res);
        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT * FROM code;`;
        var sql3 = `SELECT p.mer_id, p.name AS product_name, c.date, c.cart_id, c.loginid, pe.name AS person_name
                    FROM cart c
                    LEFT JOIN product p ON c.mer_id = p.mer_id
                    LEFT JOIN person pe ON c.loginid = pe.loginid`; 
        
        db.query(sql1 + sql2 + sql3, (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Database error');
            }
            
            var context = {
                who: name,
                login: login,
                loginid: loginid,
                body: 'cartView.ejs',
                cls: cls,
                boardtypes: results[0],
                categorys: results[1],
                carts: results[2],
                req: req
            };
        
            req.app.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Render error');
                }
                res.end(html);
            });
        });        
    },
    cartview_update: (req, res) => {
        var { name, login, loginid, cls } = authIsOwner(req, res);
        var cart_id = parseInt(req.params.cartId);
        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT * FROM code;`;
        var sql3 = `SELECT * FROM product;`;
        var sql4 = `SELECT * FROM person WHERE class = 'CST';`;
        var sql5 = `SELECT * FROM cart WHERE cart_id = ?;`; 
        
        db.query(sql1 + sql2 + sql3 + sql4 + sql5, [cart_id], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Database error');
            }
            var context = {
                who: name,
                login: login,
                loginid: loginid,
                body: 'cartU.ejs',
                cls: cls,
                boardtypes: results[0],
                categorys: results[1],
                products: results[2],
                persons: results[3],
                carts: results[4],
                req: req
            };
        
            req.app.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Render error');
                }
                res.end(html);
            });
        });        
    },
    cartview_update_process: (req, res) => {
        var cart = req.body;
        sntzedcartId = parseInt(sanitizeHtml(cart.cart_id))
        sntzedloginid = sanitizeHtml(cart.loginid)
        sntzedMerId = parseInt(sanitizeHtml(cart.mer_id))
        db.query(`UPDATE cart SET loginid = ?, mer_id = ? WHERE cart_id = ?`,[sntzedloginid, sntzedMerId, sntzedcartId], (error, result) => {
                if (error) {
                    throw error;
                }
            res.writeHead(302, { Location: `/cartview` });
            res.end();
        });
    },
    cartview_delete: (req, res) => {
        var cart_id = req.params.cartId;
        db.query(`DELETE FROM cart WHERE cart_id = ?`,[cart_id], (error, result) => {
                if (error) {
                    throw error;
                }
            res.writeHead(302, { Location: `/cartview` });
            res.end();
        });
    },
    purchaseview: (req, res) => {
        var { name, login, loginid, cls } = authIsOwner(req, res);

        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT * FROM code;`;
        var sql3 = `SELECT pu.purchase_id, pu.loginid, pe.name AS person_name, pu.mer_id, pr.name AS product_name, pu.date, pu.price, pu.point, pu.qty, pu.total, pu.payYN, pu.cancel, pu.refund
                    FROM purchase pu
                    LEFT JOIN product pr ON pu.mer_id = pr.mer_id
                    LEFT JOIN person pe ON pe.loginid = pu.loginid`; 
        
        db.query(sql1 + sql2 + sql3, [loginid], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Database error');
            }
            var context = {
                who: name,
                login: login,
                loginid: loginid,
                body: 'purchaseView.ejs',
                cls: cls,
                boardtypes: results[0],
                categorys: results[1],
                purchases: results[2],
                req: req
            };
        
            req.app.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Render error');
                }
                res.end(html);
            });
        });        
    },
    purchaseupdate: (req, res) => {
        var { name, login, loginid, cls } = authIsOwner(req, res);
        var purchase_id = parseInt(req.params.purchaseId);
        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT * FROM code;`;
        var sql3 = `SELECT * FROM product;`;
        var sql4 = `SELECT * FROM person WHERE class = 'CST';`;
        var sql5 = `SELECT pu.purchase_id, pu.loginid, pe.name AS person_name, pu.mer_id, pr.name AS product_name, pu.date, pu.price, pu.point, pu.qty, pu.total, pu.payYN, pu.cancel, pu.refund
                    FROM purchase pu
                    LEFT JOIN product pr ON pu.mer_id = pr.mer_id
                    LEFT JOIN person pe ON pe.loginid = pu.loginid
                    WHERE pu.purchase_id = ?`; 
                    
        db.query(sql1 + sql2 + sql3 + sql4 + sql5, [purchase_id], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Database error');
            }
            var context = {
                who: name,
                login: login,
                loginid: loginid,
                body: 'purchaseU.ejs',
                cls: cls,
                boardtypes: results[0],
                categorys: results[1],
                products: results[2],
                persons: results[3],
                purchases: results[4],
                req: req
            };
        
            req.app.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Render error');
                }
                res.end(html);
            });
        });            
    },
    purchaseupdate_process: (req, res) => {
        var purchase = req.body;
        sntzedpurchaseId = parseInt(sanitizeHtml(purchase.purchase_id))
        sntzedloginid = sanitizeHtml(purchase.loginid)
        sntzedMerId = parseInt(sanitizeHtml(purchase.mer_id))
        sntzedDate = sanitizeHtml(purchase.date)
        sntzedPrice = parseInt(sanitizeHtml(purchase.price))
        sntzedPoint = parseInt(sanitizeHtml(purchase.point))
        sntzedQty = parseInt(sanitizeHtml(purchase.qty))
        sntzedTotal = parseInt(sanitizeHtml(purchase.total))
        sntzedPayYN = sanitizeHtml(purchase.payYN)
        sntzedCancel = sanitizeHtml(purchase.cancel)
        sntzedRefund = sanitizeHtml(purchase.refund)
        db.query(`UPDATE purchase SET loginid = ?, mer_id = ?, price = ?, point = ?, qty = ?, total = ?, payYN = ?, cancel = ?, refund = ? WHERE purchase_id = ?`,
            [sntzedloginid, sntzedMerId, sntzedPrice, sntzedPoint, sntzedQty, sntzedTotal, sntzedPayYN, sntzedCancel, sntzedRefund, sntzedpurchaseId], (error, result) => {
                if (error) {
                    throw error;
                }
            res.writeHead(302, { Location: `/purchaseview` });
            res.end();
        });
    },
    purchasedelete: (req, res) => {
        var purchase_id = req.params.purchaseId;
        db.query(`DELETE FROM purchase WHERE purchase_id = ?`,[purchase_id], (error, result) => {
                if (error) {
                    throw error;
                }
            res.writeHead(302, { Location: `/purchaseview` });
            res.end();
        });
    },
    table: (req, res) => {
        var { name, login, loginid, cls } = authIsOwner(req, res);
        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT * FROM code;`;
        var sql3 = `SELECT * FROM INFORMATION_SCHEMA.TABLES  where table_schema = 'webdb2024';`;
        db.query(sql1 + sql2 + sql3, (error, results) => {
            var context = {
                who: name,
                login: login,
                loginid: loginid,
                body: 'tableManage.ejs',
                cls: cls,
                boardtypes: results[0],
                categorys: results[1],
                tables: results[2],
                req: req
            };
        
            req.app.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Render error');
                }
                res.end(html);
            });
        });
    },
    tableview: (req, res) => {
        var { name, login, loginid, cls } = authIsOwner(req, res);
        var table_name = req.params.tableName;
        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT * FROM code;`;
        var sql3 = `SELECT * FROM information_schema.columns WHERE table_schema='webdb2024' and  table_name = ?;`;
        var sql4 = `SELECT * FROM ${table_name}`;
        db.query(sql1 + sql2 + sql3 + sql4, [table_name], (error, results) => {
            var context = {
                who: name,
                login: login,
                loginid: loginid,
                body: 'tableView.ejs',
                cls: cls,
                boardtypes: results[0],
                categorys: results[1],
                tables: results[2],
                results: results[3],
                req: req
            };
        
            req.app.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Render error');
                }
                res.end(html);
            });
        });            
    },
    anal: (req, res) => {
        var { name, login, loginid, cls } = authIsOwner(req, res);
        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT * FROM code;`;
        var sql3 = `select address, ROUND(( count(*) / (select count(*) from person)) * 100, 2) as rate from person group by address;`;
        db.query(sql1 + sql2 + sql3, (error, results) => {
            var context = {
                who: name,
                login: login,
                loginid: loginid,
                body: 'ceoAnal.ejs',
                cls: cls,
                boardtypes: results[0],
                categorys: results[1],
                percentage: results[2],
                req: req
            };
        
            req.app.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Render error');
                }
                res.end(html);
            });
        });            
    },
    
}