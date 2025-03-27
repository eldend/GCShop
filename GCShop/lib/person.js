var db = require('./db');
var sanitizeHtml = require('sanitize-html');

const util = require('./util');
module.exports = {
    home : (req, res) => {
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from person;`
        var sql3 = `select * from code;`
        db.query(sql1 + sql2 + sql3, (err, results) => {
            var context = {
                who : name,
                login : login,
                body : 'person.ejs',
                cls : cls,
                boardtypes: results[0],
                persons : results[1],
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
        var sql2 = `select * from person;`
        var sql3 = `select * from code;`
        db.query(sql1 + sql2 + sql3, (err, results) => {
            var context = {
                who : name,
                login : login,
                body : 'personCU.ejs',
                cls : cls,
                boardtypes: results[0],
                persons : results[1],
                categorys : results[2],
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
        var person = req.body;
        sntzedLoginId = sanitizeHtml(person.loginid)
        sntzedPassword = sanitizeHtml(person.password)
        sntzedName = sanitizeHtml(person.name)
        sntzedAddress = sanitizeHtml(person.address)
        sntzedTel = sanitizeHtml(person.tel)
        sntzedBirth = sanitizeHtml(person.birth)
        sntzedClass = sanitizeHtml(person.class)
        sntzedGrade = sanitizeHtml(person.grade)
        db.query(`INSERT INTO person (loginid, password, name, address, tel, birth, class, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sntzedLoginId, sntzedPassword, sntzedName, sntzedAddress, sntzedTel, sntzedBirth, sntzedClass, sntzedGrade], (error, result) => {
            if (error) {
                throw error; 
            }
        res.writeHead(302, { Location: `/person/view` });
        res.end(); 
        });
    },
    update: (req, res) => {
        var { name, login, cls } = util.authIsOwner(req, res);
        const { loginId } = req.params;
        var sql1 = `select * from boardtype;`
        var sql2 = `SELECT * FROM person WHERE loginid = ?;`
        var sql3 = `select * from code;`
        db.query( sql1+sql2+sql3, [loginId], (error, results) => {
            if (error) {
                throw error;
            }
            var context = {
                who : name,
                login : login,
                body : 'personCU.ejs',
                cls : cls,
                boardtypes: results[0],
                persons : results[1],
                categorys : results[2],
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
        var person = req.body;

        sntzedPassword = sanitizeHtml(person.password);
        sntzedName = sanitizeHtml(person.name);
        sntzedAddress = sanitizeHtml(person.address);
        sntzedTel = sanitizeHtml(person.tel);
        sntzedBirth = sanitizeHtml(person.birth);
        sntzedClass = sanitizeHtml(person.class);
        sntzedGrade = sanitizeHtml(person.grade);
    
        db.query(`UPDATE person
                SET password = ?, name = ?, address = ?, tel = ?, birth = ?, class = ?, grade = ?
                WHERE loginid = ?;`,
            [sntzedPassword, sntzedName, sntzedAddress, sntzedTel, sntzedBirth, sntzedClass, sntzedGrade, person.loginid], 
            (error, result) => {
                if (error) {
                    throw error;
                }
                res.writeHead(302, { Location: `/person/view` });
                res.end();
            });
    },
    delete_process: (req, res) => {
        const { loginId } = req.params;
        db.query('DELETE FROM person WHERE loginid = ?', 
            [loginId], (error, result) => {
            if (error) {
                throw error;
            }
            res.writeHead(302, { Location: '/person/view' });
            res.end();
        });
    },
}