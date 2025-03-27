const express = require('express');
var session = require('express-session');
var MySqlStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');

var option = {
    host    : 'localhost',
    user    : 'root',
    password: 'root',
    database: 'webdb2024'
}
var sessionStore = new MySqlStore(option);
const app = express();
app.use(session({
    secret : 'keyboard cat',
    resave : false,
    saveUninitialized : true,
    store : sessionStore
}));
app.set('views' , __dirname+'/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));

var authorRouter = require('./router/authorRouter');
var rootRouter = require('./router/rootRouter');
var codeRouter = require('./router/codeRouter');
var productRouter = require('./router/productRouter');
var personRouter = require('./router/personRouter');
var boardRouter = require('./router/boardRouter');
var purchaseRouter = require('./router/purchaseRouter');

app.use(express.static('public'));

app.use('/',rootRouter);
app.use('/auth',authorRouter);
app.use('/code',codeRouter);
app.use('/product',productRouter);
app.use('/person',personRouter);
app.use('/board',boardRouter);
app.use('/purchase',purchaseRouter);

app.get('/favicon.ico', (req, res) => res.writeHead(404));
app.listen(3000, () => console.log('Example app listening on port 3000'));