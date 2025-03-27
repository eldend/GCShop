//202139820 김경훈
var mysql = require('mysql');
var db = mysql.createConnection({
    host    : 'localhost',
    user    : 'root',
    password: 'root',
    database: 'webdb2024',
    multipleStatements: true
});

db.connect();//두 서버간에 길을 연결해 줌.
module.exports = db;
