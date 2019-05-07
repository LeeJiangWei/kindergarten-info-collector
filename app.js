var fs = require('fs');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();
var session = require('express-session');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (req, res) {
    res.redirect('main.html');
});

const nodeMailer = require('nodemailer');

let account_path = path.join(__dirname,'account.json');
let account_data = fs.readFileSync(account_path, 'utf8');
let accounts = JSON.parse(account_data);
let sender_account = accounts.sender[0].account;
let sender_pass = accounts.sender[0].password;
let receiver_account = "";
for (let i = 0; i<accounts.receiver.length;i++){
    receiver_account += accounts.receiver[i].account + ',';
}
let admin_name = accounts.admin[0].username;
let admin_pass = accounts.admin[0].password;

let transporter = nodeMailer.createTransport({
    service:'qq',
    port:465,
    secureConnection:true,
    auth:{
        user:sender_account,
        pass:sender_pass,
    }
});

let mailOptions = {
    from:sender_account,
    to:receiver_account,
    subject:'已收到新的报名信息',
    html:'',
    attachments:[{
        filename:'data.csv',
        path:path.resolve(__dirname,'data.csv'),
    }]
};

app.post('/', function (req, res) {
    fs.exists("data.csv", function (exists) {
        let data = ""; //initialize csv with dom head: \uFEFF
        if (!exists) {
            data += "\uFEFF";
            data += "报读年级,报读年份,报读学期,姓名,性别,证件类型,证件号,生日,报名日期,报名时间,联系人,联系人手机号,现住地址,备注\n";
        }
        data += req.body.grade + ',';
        data += req.body.year + ',';
        data += req.body.season + ',';
        data += req.body.name + ',';
        data += req.body.sex + ',';
        data += req.body.identity + ',';
        data += req.body.id_number + ',';
        data += req.body.birthday + ',';
        data += req.body.sign_in_day + ',';
        data += req.body.time + ',';
        data += req.body.contact +',';
        data += req.body.contact_number + ',';
        data += req.body.address + ',';
        data += req.body.remark + '\n';
        mailOptions.html = '<h1>全部报名信息请在附件中查看</h1>' +
            '<p>以下是新信息摘要：</p>' + data;
        fs.appendFile('data.csv', data, 'utf8', function (error) {
            if (error){
                return console.log(error);
            }
            console.log("data.csv write successfully");
            res.redirect('info.html');
            transporter.sendMail(mailOptions, (error, info) => {
                if (error){
                    return console.log(error);
                }
                console.log('Message has been sent: %s', info.messageId);
            });
        });
    });
});

app.use(cookieParser('login'));
app.use(session({
    secret: 'login',
    resave: true,
    saveUninitialized: true
}));

app.post("/login", function (req, res){
    const username = req.body.admin;
    const password = req.body.ad_pass;
    if (username === admin_name && password === admin_pass){
        req.session.user = {
            name:username
        };
        res.redirect("/backstage");
    }else{
        res.redirect("main.html");
    }
});

function checkLogin(req, res, next){
    if (req.session.user === undefined){
        res.redirect('main.html');
    }else{
        next();
    }
}

app.get("/backstage", checkLogin, function (req, res) {
    res.render('back');
});

app.post("/download", checkLogin, function(req, res){
    fs.readFile(path.join(__dirname, "data.csv"), function (err, data) {
        if (err){
            res.end("read file failed!");
            return console.log(err);
        }
        res.writeHead(200,{
            'Content-Type':'application/octet-stream',
            'Content-Disposition':'attachment;filename=' + 'data.csv'
        });
        res.end(data)
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
