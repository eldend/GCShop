var db = require('./db');
var sanitizeHtml = require('sanitize-html');
const util = require('./util');
module.exports = {
    purchasedetail : (req, res) => {
        var {name, login, loginid, cls} = util.authIsOwner(req, res);
        var santzedMerId = parseInt(sanitizeHtml(req.params.merId))
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        db.query(sql1+sql2+`SELECT * FROM product WHERE mer_id = ?`, [santzedMerId],(error,results)=>{

            var context = {
                who : name,
                login : login,
                loginid : loginid,
                body : 'purchaseDetail.ejs',
                cls : cls,
                boardtypes : results[0],
                categorys : results[1],
                products : results[2],
                req: req
            };
            req.app.render('mainFrame', context, (err, html) => {
                if (err) {
                    throw err;
                }
                res.end(html);
            })
        })
    },
    purchase_process: (req, res) => {
        var { loginid } = util.authIsOwner(req, res);
        var purchase = req.body;
        var santzedMerId = parseInt(sanitizeHtml(purchase.mer_id))
        var qty = req.body.qty; 
        var price = req.body.price;
        var total = price * qty;
        var point = total / 20;
        const currentTime = util.dateOfEightDigit();
        var sntzedPrice = parseInt(sanitizeHtml(price));
        var sntzedQty = parseInt(sanitizeHtml(qty));
        var santzedTotal = parseInt(sanitizeHtml(total))
        var santzedPoint= parseInt(sanitizeHtml(point))
        var insertSql = `INSERT INTO purchase (loginid, mer_id, date, price, qty, payYN, cancel, refund, total, point) 
        VALUES (?, ?, ?, ?, ?, 'Y', 'N', 'N', ?, ?);`;
        db.query(insertSql, [loginid, santzedMerId, currentTime, sntzedPrice, sntzedQty, santzedTotal, santzedPoint], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Database error');
            }
        
            res.writeHead(302, { Location: `/purchase` });
            res.end(); 
        });        
    },
    
    purchase: (req, res) => {
        var { name, login, loginid, cls } = util.authIsOwner(req, res);

        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT * FROM code;`;
        var sql3 = `SELECT p.mer_id, p.name, pu.price, p.image, pu.qty, pu.total, pu.date, pu.cancel, pu.purchase_id
                    FROM purchase pu
                    LEFT JOIN product p ON pu.mer_id = p.mer_id
                    WHERE pu.loginid = ?`; 
        
        db.query(sql1 + sql2 + sql3, [loginid], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Database error');
            }
            var context = {
                who: name,
                login: login,
                loginid: loginid,
                body: 'purchase.ejs',
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
    cancel: (req, res) => {
        const purchase_id = parseInt(req.params.purchaseId);
        db.query(`UPDATE purchase SET cancel = 'Y' WHERE purchase_id = ?`, [purchase_id], (error, result) => {
                if (error) {
                    throw error;
                }
            res.writeHead(302, { Location: `/purchase` });
            res.end();
        });
    },
    cart_process: (req, res) => {
        const loginid = req.session.loginid;
        var purchase = req.body;
        var santzedMerId = parseInt(sanitizeHtml(purchase.mer_id))
        const currentTime = util.dateOfEightDigit(); 
        const checkSql = `SELECT * FROM cart WHERE loginid = ? AND mer_id = ?;`;
        db.query(checkSql, [loginid, santzedMerId], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Database error');
            }
    
            if (results.length > 0) {
                // 장바구니에 이미 있는 경우
                return res.send(`
                    <html>
                        <head>
                            <meta charset="UTF-8">
                        </head>
                        <body>
                            <script type='text/javascript'>
                                alert("장바구니에 이미 있는 제품입니다.");
                                setTimeout(function() {
                                    location.href='http://localhost:3000/purchase/cart';
                                }, 1000);
                            </script>
                        </body>
                    </html>
                `);
            } else {
                // 장바구니에 없는 경우, 추가하기
                const insertSql = `INSERT INTO cart (loginid, mer_id, date) VALUES (?, ?, ?);`;
                db.query(insertSql, [loginid, santzedMerId, currentTime], (error, result) => {
                    if (error) {
                        console.error(error);
                        return res.status(500).send('Database error');
                    }
                    // 성공적으로 장바구니에 추가 후 리디렉션
                    res.redirect('/purchase/cart');
                });
            }
        });
    },    
    cart: (req, res) => {
        var { name, login, loginid, cls } = util.authIsOwner(req, res);
        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT * FROM code;`;
        var sql3 = `SELECT p.mer_id, p.name, p.price, p.image, c.date, c.cart_id
                    FROM cart c
                    LEFT JOIN product p ON c.mer_id = p.mer_id
                    WHERE c.loginid = ?`; 
        
        db.query(sql1 + sql2 + sql3, [loginid], (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).send('Database error');
            }
            var context = {
                who: name,
                login: login,
                loginid: loginid,
                body: 'cart.ejs',
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
    cart_purchase: (req, res) => {
        var { loginid } = util.authIsOwner(req, res);
        var santzedCartId = parseInt(sanitizeHtml(req.body.cart_id));
        const currentTime = util.dateOfEightDigit();

        const selectCartSql = `SELECT pu.mer_id, pu.price, c.cart_id, c.date, c.cart_id, c.loginid
                    FROM cart c
                    LEFT JOIN purchase pu ON c.mer_id = pu.mer_id
                    WHERE c.cart_id = ?`;
        
        db.query(selectCartSql, [santzedCartId], (error, cartResults) => {
            var cartItem = cartResults[0];
            var mer_id = cartItem.mer_id;
            var price = cartItem.price;
            var qty = req.body[`qty_${santzedCartId}`];
            var total = price * qty;
            var point = total / 20;
            const insertPurchaseSql = `INSERT INTO purchase (loginid, mer_id, date, price, qty, payYN, cancel, refund, total, point) 
                VALUES (?, ?, ?, ?, ?, 'Y', 'N', 'N', ?, ?)`;
        
            db.query(insertPurchaseSql, [loginid, mer_id, currentTime, price, qty, total, point], (error, results) => {
                const deleteSql = `DELETE FROM cart WHERE cart_id = ?`;
                db.query(deleteSql, [santzedCartId], (error, results) => {
                    res.writeHead(302, { Location: `/purchase` });
                    res.end(); 
                });
            });
        });
    },
    
    cart_cancel: (req, res) => {
        const cart_id = parseInt(req.body.cart_id);
        db.query('DELETE FROM cart WHERE cart_id = ?', 
            [cart_id], (error, result) => {
            if (error) {
                throw error;
            }
            res.writeHead(302, { Location: '/purchase/cart' });
            res.end();
        });
    },
}