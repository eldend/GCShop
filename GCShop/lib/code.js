var db = require('./db');
var sanitizeHtml = require('sanitize-html');

const util = require('./util');
module.exports = {
    home : (req, res) => {
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        db.query(sql1 + sql2, (err, results) => {
            var context = {
                who : name,
                login : login,
                body : 'code.ejs',
                cls : cls,
                boardtypes: results[0],
                codes: results[1],
                categorys: results[1],
                req: req
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
        db.query(sql1 + sql2, (err2, results) => {
            var context = {
                who : name,
                login : login,
                body : 'codeCU.ejs',
                cls : cls,
                boardtypes: results[0],
                categorys: results[1],
                req: req
            };
            req.app.render('mainFrame', context, (err, html) => {
                res.end(html);
            })
        })
    },
    create_process: (req, res) => {
        var post = req.body;
        sanitizedMain_Id = sanitizeHtml(post.main_id)
        sanitizedSub_Id = sanitizeHtml(post.sub_id)
        sanitizedMain_Name = sanitizeHtml(post.main_name)
        sanitizedSub_Name = sanitizeHtml(post.sub_name)
        sanitizedStart = sanitizeHtml(post.start)
        sanitizedEnd = sanitizeHtml(post.end)
        db.query(`INSERT INTO code (main_id, sub_id, main_name, sub_name, start, end) VALUES (?, ?, ?, ?, ?, ?)`,
        [sanitizedMain_Id, sanitizedSub_Id, sanitizedMain_Name, sanitizedSub_Name, sanitizedStart, sanitizedEnd], (error, result) => {
            if (error) {
                throw error; 
            }
        res.writeHead(302, { Location: `/code/view` });
        res.end(); 
        });
    },
    update: (req, res) => {
        var {name, login, cls} = util.authIsOwner(req, res);
        const main_id = req.params.main;
        const sub_id = req.params.sub;
        const start = req.params.start;
        const end = req.params.end;
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        var sql3 = `select * from code WHERE main_id = ? AND sub_id = ? AND start = ? AND end = ?`
        db.query(sql1 + sql2 + sql3, [main_id, sub_id, start, end], (err2, results) => {
            var context = {
                who : name,
                login : login,
                body : 'codeCU.ejs',
                cls : cls,
                boardtypes: results[0],
                categorys: results[1],
                codes: results[2],
                req: req
            };
            req.app.render('mainFrame', context, (err, html) => {
                if(err) {
                    throw err
                }
                res.end(html);
            })
        })
    },
    update_process: (req, res) => {
        var post = req.body;
        sanitizedMain_Name = sanitizeHtml(post.main_name)
        sanitizedSub_Name = sanitizeHtml(post.sub_name)
        sanitizedStart = sanitizeHtml(post.start)
        sanitizedEnd = sanitizeHtml(post.end)
        db.query(`UPDATE code SET main_name = ?, sub_name = ?, start = ? WHERE main_id = ? AND sub_id =?`,
            [sanitizedMain_Name, sanitizedSub_Name, sanitizedStart, post.main_id, post.sub_id], (error, result) => {
                if (error) {
                    throw error;
                }
            res.writeHead(302, { Location: `/code/view` });
            res.end();
        });
    },
    delete_process: (req, res) => {
        const { main, sub, start, end } = req.params;
        db.query('DELETE FROM code WHERE main_id = ? AND sub_id = ? AND start = ? AND end = ?', 
            [main, sub, start, end], (error, result) => {
            if (error) {
                throw error;
            }
            res.writeHead(302, { Location: '/code/view' });
            res.end();
        });
    },
}