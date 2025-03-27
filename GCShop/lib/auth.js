var db = require('./db');
var sanitizeHtml = require('sanitize-html');

const util = require('./util');

module.exports = {
    login : (req, res) => {
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from product;`
        var sql3 = `select * from code`
        db.query(sql1+sql2+sql3,(error,results)=>{
            var context = {
                who : name,
                login : login,
                body : 'login.ejs',
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
    login_process : (req, res) => {
        var post = req.body;
        var sntzedLoginId = sanitizeHtml(post.loginid);
        var sntzedPassword = sanitizeHtml(post.password);

        db.query('select count(*) as num from person where loginid = ? and password = ?',
        [sntzedLoginId,sntzedPassword], (error, results)=>{
            if(results[0].num === 1){//id와 password가 같은 사람이 1명일때

                db.query('select name, class, loginid, grade from person where loginid =? and password = ?',
        [sntzedLoginId, sntzedPassword],(error, result)=>{
                    req.session.is_logined = true;
                    req.session.loginid = result[0].loginid;
                    req.session.name = result[0].name;
                    req.session.cls = result[0].class;
                    req.session.grade = result[0].grade;
                    res.redirect('/');
                })
            }
            else {
                   req.session.is_logined = false;
                   req.session.name = 'Guest';
                   req.session.cls = 'NON';
                   req.session.login = false;
                   req.session.loginid = null;
                   res.end(                   `
                     <html>
                        <head>
                            <meta charset="UTF-8">
                        </head>
                        <body>
                        <script language="JavaScript" type="text/javascript" meta charset="UTF-8">
                            alert("비밀번호가 일치하지 않습니다.");
                            setTimeout(function() {
                                location.href = 'http://localhost:3000/';
                            }, 1000);
                        </script>
                        </body>
                    </html>
                `);
            }
        })
    },
    logout_process : (req, res) => {
        req.session.destroy((err)=>{
            res.redirect('/');
        })
    },
    register : (req, res) => {
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from product;`
        var sql3 = `select * from code`
        db.query(sql1+sql2+sql3,(error,results)=>{
            var context = {
                who : name,
                login : login,
                body : 'personCU.ejs',
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
    register_process: (req, res) => {
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
        res.writeHead(302, { Location: `/` });
        res.end(); 
        });
    },
}