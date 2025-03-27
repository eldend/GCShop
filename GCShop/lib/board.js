var db = require('./db');
var sanitizeHtml = require('sanitize-html');
const util = require('./util');
module.exports = {
    typeview : (req, res) => {
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        db.query(sql1+sql2, (err, results) => {
            var context = {
                who : name,
                login : login,
                body : 'boardtype.ejs',
                cls : cls,
                boardtypes: results[0],
                categorys : results[1],
                req: req,
            };
            req.app.render('mainFrame', context, (err, html) => {
                res.end(html);
            })
        })
    },
    typecreate: (req, res) => {
        var {name, login, cls} = util.authIsOwner(req, res);
        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `select * from code;`
        db.query(sql1+sql2, (err, results) => {
    
            var context = {
                who: name,
                login: login,
                body: 'boardtypeCU.ejs',
                cls: cls,
                boardtypes: results[0],
                categorys : results[1],
                req: req,
            };
    
            req.app.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.error('Error rendering page:', err);
                    return res.status(500).send('Error rendering page');
                }
                res.end(html);
            });
        });
    },
    typecreate_process: (req, res) => {
        var boardtype = req.body;
        sntzedTitle = sanitizeHtml(boardtype.title)
        sntzedDescription = sanitizeHtml(boardtype.description)
        sntzedNumPerPage = parseInt(sanitizeHtml(boardtype.numPerPage))
        sntzedWrite_YN = sanitizeHtml(boardtype.write_YN)
        sntzedRe_YN = sanitizeHtml(boardtype.re_YN)
        db.query(`INSERT INTO boardtype (title, description, numPerPage, write_YN, re_YN) VALUES (?, ?, ?, ?, ?)`,
        [sntzedTitle, sntzedDescription, sntzedNumPerPage, sntzedWrite_YN, sntzedRe_YN], (error, result) => {
            if (error) {
                throw error; 
            }
        res.writeHead(302, { Location: `/board/type/view` });
        res.end(); 
        });
    },
    typeupdate: (req, res) => {
        const { name, login, cls } = util.authIsOwner(req, res);
        const type_id = req.params.typeId; 
        sql1 = `select * from boardtype;`
        sql2 = `select * from code;`
        db.query(sql1+sql2+'SELECT * FROM boardtype WHERE type_id = ?', [type_id], (error, results) => {
            
            const context = {
                who: name,
                login: login,
                body: 'boardtypeCU.ejs',
                cls: cls,
                boardtypes: results[0],
                categorys : results[1],
                boardtypes2: results[2],
                req: req
            };
        
            res.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.error("Rendering error:", err);
                    return res.status(500).send('페이지 렌더링 중 오류가 발생했습니다.');
                }
                res.end(html);
            });
        });
        
    },
    typeupdate_process: (req, res) => {
        var boardtype = req.body;
        sntzedTitle = sanitizeHtml(boardtype.title)
        sntzedDescription = sanitizeHtml(boardtype.description)
        sntzedNumPerPage = parseInt(sanitizeHtml(boardtype.numPerPage))
        sntzedWrite_YN = sanitizeHtml(boardtype.write_YN)
        sntzedRe_YN = sanitizeHtml(boardtype.re_YN)
        db.query(`UPDATE boardtype SET title = ?, description = ?, numPerPage = ?, write_YN = ?, re_YN = ?  WHERE type_id = ?`,
        [sntzedTitle, sntzedDescription, sntzedNumPerPage, sntzedWrite_YN, sntzedRe_YN, boardtype.type_id], (error, result) => {
            if (error) {
                throw error; 
            }
        res.writeHead(302, { Location: `/board/type/view` });
        res.end(); 
        });
    },
    typedelete_process: (req, res) => {
        const { type_id } = req.params;
        db.query('DELETE FROM boardtype WHERE type_id = ?', [type_id], (error, result) => {
            if (error) {
                throw error;
            }
            res.writeHead(302, { Location: '/board/type/view' });
            res.end();
        });
    },
    view: (req, res) => {
        const { name, login, cls } = util.authIsOwner(req, res);

        // 입력값 정리
        const sanitizedTypeId = parseInt(sanitizeHtml(req.params.typeId));
        const pNum = parseInt(req.params.pNum);

        // SQL 쿼리 정의
        const sql1 = `SELECT * FROM boardtype;`; 
        const sql2 = `SELECT * FROM code;`
        const sql3 = `SELECT * FROM boardtype WHERE type_id = ${sanitizedTypeId};`; 
        const sql4 = `SELECT COUNT(*) AS total FROM board WHERE type_id = ${sanitizedTypeId};`;
        const sql5 = `
        SELECT 
            b.board_id AS board_id,
            b.title AS title,
            b.date AS date,
            p.name AS name
        FROM 
            board b
        INNER JOIN 
            person p ON b.loginid = p.loginid
        WHERE 
            b.type_id = ? AND b.p_id = ?
        ORDER BY 
            date DESC, board_id DESC
        LIMIT ? OFFSET ?;`;
        db.query(sql1 + sql2 + sql3 + sql4, (error, results) => {
            const numPerPage = results[2][0].numPerPage; // 페이지당 게시물 수
            const offset = (pNum - 1) * numPerPage;  // 페이징을 위한 OFFSET 계산
            const totalPages = Math.ceil(results[3][0].total / numPerPage); // 총 페이지 수 계산
            db.query(sql5, [sanitizedTypeId, 0, numPerPage, offset], (err, boards) => {
                const context = {
                    who: name,
                    login: login,
                    body: 'board.ejs',
                    cls: cls,
                    boardtypes: results[0], // sql1 결과
                    categorys: results[1], // sql4 결과
                    totalPages: totalPages,
                    boardtypes2: results[2], // sql1 결과
                    boards: boards, // sql5 결과
                    req: req,
                    pNum: pNum,
                };
    
                res.render('mainFrame', context, (err, html) => {
                    if (err) {
                        throw err;
                    }
                    res.end(html);
                });
                }
            );
        });
    },    
    create: (req, res) => {
        var {name, login, loginid, cls} = util.authIsOwner(req, res);
        const sanitizedTypeId = parseInt(sanitizeHtml(req.params.typeId));
        const sanitizedPnum = parseInt(sanitizeHtml(req.params.pNum));
        var sql1 = `SELECT * FROM boardtype;`;  // 전체 boardtype 조회
        var sql2 = `select * from code;`
        var sql3 = `select * from boardtype WHERE type_id = ?;`
        db.query(sql1+sql2+sql3+`SELECT * FROM board WHERE b.type_id = ?`, [sanitizedTypeId, sanitizedTypeId], (err, results) => {
            var context = {
                who: name,
                login: login,
                body: 'boardCRU.ejs',
                cls: cls,
                boardtypes: results[0],
                categorys : results[1],
                boardtypes2: results[2],
                boards : results[3],
                typeId: sanitizedTypeId,
                loginid : loginid,
                req: req,
                pNum: sanitizedPnum
            };
    
            req.app.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.error('Error rendering page:', err);
                    return res.status(500).send('Error rendering page');
                }
                res.end(html);
            });
        });
    },
    create_process: (req, res) => {
        var board = req.body;
        var {loginid} = util.authIsOwner(req, res);
        const sanitizedTypeId = parseInt(sanitizeHtml(board.type_id));
        const sanitizedPassword = sanitizeHtml(board.password);
        const sanitizedTitle = sanitizeHtml(board.title);
        const sanitizedContent = sanitizeHtml(board.content);
        const currentTime = util.dateOfEightDigit();
        db.query(
            `INSERT INTO board (type_id, loginid, password, title, content, date, p_id) VALUES (?, ?, ?, ?, ?, ?, 0)`,
            [sanitizedTypeId, loginid, sanitizedPassword, sanitizedTitle, sanitizedContent, currentTime],
            (error, result) => {
                if (error) {
                    console.error('SQL Error:', error);
                    return res.status(500).send('Database error');
                }
                res.writeHead(302, { Location: `/board/view/${sanitizedTypeId}/1` });
                res.end();
            }
        );
    },
    detail: (req, res) => {
        const { name, login, cls, loginid } = util.authIsOwner(req, res);

        const sanitizedBoardId = parseInt(sanitizeHtml(req.params.boardId));
        const pNum = parseInt(req.params.pNum);
        var sql1 = `SELECT * FROM boardtype;`; // results[0]
        var sql2 = `select * from code;`
        var sql3 = `select b.title, p.name AS name, b.date, b.content, b.type_id, b.loginid, b.date, b.board_id
                    from board b
                    LEFT JOIN person p ON b.loginid = p.loginid
                    WHERE board_id = ?;`
        db.query(sql1 + sql2 + sql3, [sanitizedBoardId], (error, results) => {
            const context = {
                who: name,
                login: login,
                loginid: loginid,
                body: 'boarddetail.ejs',
                cls: cls,
                boardtypes: results[0], // sql1 결과
                categorys: results[1], // sql4 결과
                boards: results[2], // sql5 결과
                req: req,
                pNum: pNum,
            };
    
            res.render('mainFrame', context, (err, html) => {
                res.end(html);
            });
        });
    },
    update: (req, res) => {
        const { name, login, cls } = util.authIsOwner(req, res);
        const {boardId, typeId, pNum} = req.params; 
        sql1 = `select * from boardtype;`
        sql2 = `select * from code;`
        sql3 = `select * from boardtype WHERE type_id = ?;`
        db.query(sql1 + sql2 + sql3 +'SELECT * FROM board b LEFT JOIN person p ON p.loginid = b.loginid WHERE b.type_id = ? AND b.board_id = ?', [typeId, typeId, boardId], (error, results) => {
            const context = {
                who: name,
                login: login,
                body: 'boardCRU.ejs',
                cls: cls,
                boardtypes: results[0],
                categorys : results[1],
                boardtypes2: results[2],
                boards: results[3],
                req: req,
                pNum: pNum
            };
        
            res.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.error("Rendering error:", err);
                    return res.status(500).send('페이지 렌더링 중 오류가 발생했습니다.');
                }
                res.end(html);
            });
        });
    },
    update_process: (req, res) => {
        var board = req.body;
        var { loginid, cls } = util.authIsOwner(req, res);
        const sanitizedpNum = parseInt(sanitizeHtml(board.pNum));
        const sanitizedTypeId = parseInt(sanitizeHtml(board.type_id));
        const sanitizedPassword = sanitizeHtml(board.password);
        const sanitizedTitle = sanitizeHtml(board.title);
        const sanitizedContent = sanitizeHtml(board.content);
        const currentTime = util.dateOfEightDigit();
        const sanitizedBoardId = parseInt(sanitizeHtml(board.board_id))
        var sql1 = `select * from board WHERE type_id = ? AND loginid = ?;`
        db.query(sql1, [sanitizedTypeId, loginid],  (err,result) => {
            if (result[0].password != sanitizedPassword && cls == 'CST') {
                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
                res.end(`
                     <html>
                        <head>
                            <meta charset="UTF-8">
                        </head>
                        <body>
                        <script language="JavaScript" type="text/javascript">
                            alert("비밀번호가 일치하지 않습니다.");
                            setTimeout(function() {
                                location.href = 'http://localhost:3000/board/update/${sanitizedBoardId}/${sanitizedTypeId}/${sanitizedpNum}';
                            }, 1000);
                        </script>
                        </body>
                    </html>
                `);
                return;
            }
            db.query(
                `UPDATE board 
                SET title = ?, content = ?, date = ? 
                WHERE type_id = ? AND board_id = ?`,
                [sanitizedTitle, sanitizedContent, currentTime, sanitizedTypeId, sanitizedBoardId],
                (error, results) => {
                    if (error) {
                        console.error('SQL Error:', error);
                        return res.status(500).send('Database error');
                    }
        
                    res.writeHead(302, { Location: `/board/detail/${sanitizedBoardId}/${sanitizedpNum}` });
                    res.end();
            });
        })
    },
    delete_process: (req, res) => {
        const { boardId, typeId, pNum } = req.params;
        db.query('DELETE FROM board WHERE board_id = ? AND type_id = ?', 
            [boardId, typeId], (error, result) => {
            if (error) {
                throw error;
            }
            res.writeHead(302, { Location: `/board/view/${typeId}/${pNum}` });
            res.end();
        });
    },
}